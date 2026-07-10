from __future__ import annotations

import os
from datetime import datetime, timezone

import psycopg2
import requests
from dotenv import load_dotenv


def fetch_repositories(
    owner: str, token: str | None, search_query: str | None = None
) -> list[dict]:
    headers = {"Accept": "application/vnd.github+json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    url = (
        "https://api.github.com/search/repositories"
        if search_query
        else f"https://api.github.com/users/{owner}/repos"
    )
    params = (
        {"q": search_query, "per_page": 100, "sort": "stars", "order": "desc"}
        if search_query
        else {"per_page": 100, "sort": "updated"}
    )
    response = requests.get(
        url,
        params=params,
        headers=headers,
        timeout=30,
    )
    response.raise_for_status()
    payload = response.json()
    return payload["items"] if search_query else payload


def main() -> None:
    load_dotenv()
    owner = os.environ["GITHUB_OWNER"]
    search_query = os.getenv("GITHUB_QUERY") or None
    repositories = fetch_repositories(
        owner, os.getenv("GITHUB_TOKEN"), search_query=search_query
    )
    connection = psycopg2.connect(
        host=os.getenv("POSTGRES_HOST", "localhost"),
        port=int(os.getenv("POSTGRES_PORT", "5432")),
        dbname=os.getenv("POSTGRES_DB", "github_bi"),
        user=os.getenv("POSTGRES_USER", "postgres"),
        password=os.getenv("POSTGRES_PASSWORD", "postgres"),
    )
    collected_at = datetime.now(timezone.utc)
    try:
        with connection, connection.cursor() as cursor:
            if search_query:
                cursor.execute("truncate table raw.github_repositories")
            for repository in repositories:
                cursor.execute(
                    """
                    insert into raw.github_repositories (
                        repository_id, repository_name, repository_full_name,
                        description, language, stars, forks, open_issues,
                        is_archived, created_at, updated_at, collected_at
                    ) values (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    on conflict (repository_id) do update set
                        repository_name = excluded.repository_name,
                        description = excluded.description,
                        language = excluded.language,
                        stars = excluded.stars,
                        forks = excluded.forks,
                        open_issues = excluded.open_issues,
                        is_archived = excluded.is_archived,
                        updated_at = excluded.updated_at,
                        collected_at = excluded.collected_at
                    """,
                    (
                        repository["id"],
                        repository["name"],
                        repository["full_name"],
                        repository.get("description"),
                        repository.get("language"),
                        repository.get("stargazers_count", 0),
                        repository.get("forks_count", 0),
                        repository.get("open_issues_count", 0),
                        repository.get("archived", False),
                        repository.get("created_at"),
                        repository.get("updated_at"),
                        collected_at,
                    ),
                )
    finally:
        connection.close()
    source = f"search '{search_query}'" if search_query else f"owner {owner}"
    print(f"Loaded {len(repositories)} repositories from {source}.")


if __name__ == "__main__":
    main()
