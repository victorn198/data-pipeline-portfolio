from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from threading import RLock
from uuid import uuid4


UTC = timezone.utc


class ProposalStoreError(RuntimeError):
    """Raised when proposal storage operations fail."""


class ProposalStore:
    def __init__(self, data_root: Path | None = None) -> None:
        app_root = Path(__file__).resolve().parents[1]
        self.data_root = data_root or app_root / "agent_data"
        self.proposals_path = self.data_root / "proposals.json"
        self.audit_log_path = self.data_root / "audit_log.jsonl"
        self.page_overrides_path = self.data_root / "page_overrides.json"
        self.metric_overrides_path = self.data_root / "metric_overrides.json"
        self._lock = RLock()
        self.data_root.mkdir(parents=True, exist_ok=True)

    def list_proposals(self) -> list[dict]:
        with self._lock:
            if not self.proposals_path.exists():
                return []
            with self.proposals_path.open("r", encoding="utf-8") as handle:
                payload = json.load(handle)
            if not isinstance(payload, list):
                raise ProposalStoreError("Invalid proposals store format")
            return payload

    def get_proposal(self, proposal_id: str) -> dict:
        for proposal in self.list_proposals():
            if proposal.get("proposal_id") == proposal_id:
                return proposal
        raise ProposalStoreError(f"Proposal not found: {proposal_id}")

    def create_proposal(self, proposal: dict) -> dict:
        with self._lock:
            proposals = self.list_proposals()
            record = {
                **proposal,
                "proposal_id": str(uuid4()),
                "created_at": datetime.now(UTC).isoformat(),
                "status": "proposed",
            }
            proposals.append(record)
            self._write_proposals(proposals)
            self._append_audit_event(
                {
                    "event_type": "proposal_created",
                    "created_at": record["created_at"],
                    "proposal_id": record["proposal_id"],
                    "status": record["status"],
                    "payload": {
                        "page": record.get("page"),
                        "target": record.get("target"),
                        "title": record.get("title"),
                    },
                }
            )
            return record

    def update_proposal_status(self, proposal_id: str, status: str, reviewer_note: str | None = None) -> dict:
        with self._lock:
            proposals = self.list_proposals()
            for proposal in proposals:
                if proposal.get("proposal_id") == proposal_id:
                    proposal["status"] = status
                    if reviewer_note:
                        proposal["reviewer_note"] = reviewer_note
                    proposal["updated_at"] = datetime.now(UTC).isoformat()
                    self._write_proposals(proposals)
                    self._append_audit_event(
                        {
                            "event_type": "proposal_status_changed",
                            "created_at": proposal["updated_at"],
                            "proposal_id": proposal_id,
                            "status": status,
                            "payload": {"reviewer_note": reviewer_note or ""},
                        }
                    )
                    return proposal
        raise ProposalStoreError(f"Proposal not found: {proposal_id}")

    def mark_proposal_applied(self, proposal_id: str) -> dict:
        with self._lock:
            proposals = self.list_proposals()
            for proposal in proposals:
                if proposal.get("proposal_id") == proposal_id:
                    proposal["applied_to_draft_at"] = datetime.now(UTC).isoformat()
                    proposal["updated_at"] = proposal["applied_to_draft_at"]
                    self._write_proposals(proposals)
                    self._append_audit_event(
                        {
                            "event_type": "proposal_applied_to_draft",
                            "created_at": proposal["applied_to_draft_at"],
                            "proposal_id": proposal_id,
                            "status": proposal.get("status"),
                            "payload": {
                                "page": proposal.get("page"),
                                "target": proposal.get("target"),
                                "title": proposal.get("title"),
                            },
                        }
                    )
                    return proposal
        raise ProposalStoreError(f"Proposal not found: {proposal_id}")

    def read_page_overrides(self) -> dict:
        return self._read_override_payload(self.page_overrides_path, root_key="pages")

    def read_metric_overrides(self) -> dict:
        return self._read_override_payload(self.metric_overrides_path, root_key="metrics")

    def draft_state(self) -> dict:
        return {
            "page_overrides": self.read_page_overrides().get("pages", {}),
            "metric_overrides": self.read_metric_overrides().get("metrics", {}),
        }

    def clear_drafts(self) -> None:
        with self._lock:
            for path in (self.page_overrides_path, self.metric_overrides_path):
                if path.exists():
                    path.unlink()
            self._append_audit_event(
                {
                    "event_type": "drafts_cleared",
                    "created_at": datetime.now(UTC).isoformat(),
                    "proposal_id": None,
                    "status": None,
                    "payload": {},
                }
            )

    def write_page_override(self, page: str, override: dict) -> dict:
        with self._lock:
            payload = self.read_page_overrides()
            payload["pages"][page] = {**payload["pages"].get(page, {}), **override}
            self._write_override_payload(self.page_overrides_path, payload)
            return payload

    def write_metric_override(self, metric_key: str, override: dict) -> dict:
        with self._lock:
            payload = self.read_metric_overrides()
            payload["metrics"][metric_key] = {**payload["metrics"].get(metric_key, {}), **override}
            self._write_override_payload(self.metric_overrides_path, payload)
            return payload

    def read_audit_events(self, limit: int = 50) -> list[dict]:
        with self._lock:
            if not self.audit_log_path.exists():
                return []
            with self.audit_log_path.open("r", encoding="utf-8") as handle:
                lines = [line.strip() for line in handle.readlines() if line.strip()]
            events = [json.loads(line) for line in lines]
            return events[-limit:]

    def _read_override_payload(self, path: Path, root_key: str) -> dict:
        with self._lock:
            if not path.exists():
                return {root_key: {}}
            with path.open("r", encoding="utf-8") as handle:
                payload = json.load(handle)
            if not isinstance(payload, dict):
                raise ProposalStoreError(f"Invalid override store format: {path.name}")
            payload.setdefault(root_key, {})
            return payload

    def _write_override_payload(self, path: Path, payload: dict) -> None:
        self._atomic_write_json(path, payload)

    def _write_proposals(self, proposals: list[dict]) -> None:
        self._atomic_write_json(self.proposals_path, proposals)

    MAX_AUDIT_EVENTS = 10_000

    def _append_audit_event(self, event: dict) -> None:
        with self._lock:
            with self.audit_log_path.open("a", encoding="utf-8") as handle:
                handle.write(json.dumps(event, ensure_ascii=False) + "\n")
            self._rotate_audit_log_if_needed()

    def _rotate_audit_log_if_needed(self) -> None:
        if not self.audit_log_path.exists():
            return
        with self.audit_log_path.open("r", encoding="utf-8") as handle:
            lines = handle.readlines()
        if len(lines) <= self.MAX_AUDIT_EVENTS:
            return
        # Keep most recent half
        keep = lines[len(lines) // 2:]
        temp_path = self.audit_log_path.with_suffix(".jsonl.tmp")
        with temp_path.open("w", encoding="utf-8") as handle:
            handle.writelines(keep)
        temp_path.replace(self.audit_log_path)

    def _atomic_write_json(self, path: Path, payload: dict | list[dict]) -> None:
        temp_path = path.with_suffix(path.suffix + ".tmp")
        with temp_path.open("w", encoding="utf-8") as handle:
            json.dump(payload, handle, ensure_ascii=False, indent=2)
        temp_path.replace(path)
