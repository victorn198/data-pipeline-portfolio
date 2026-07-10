create schema if not exists mart;

drop view if exists mart.vw_powerbi_repositories;

create or replace view mart.vw_powerbi_repositories as
select
    repository_id,
    repository_name,
    repository_full_name,
    split_part(repository_full_name, '/', 1) as repository_owner,
    coalesce(language, 'Unknown') as language,
    stars,
    forks,
    open_issues,
    is_archived,
    created_at::date as created_date,
    updated_at::date as updated_date,
    collected_at::date as collected_date,
    current_date - updated_at::date as days_since_update,
    case
        when is_archived then 'Archived'
        when updated_at >= now() - interval '90 days' then 'Active'
        else 'Stale'
    end as activity_status
from raw.github_repositories;
