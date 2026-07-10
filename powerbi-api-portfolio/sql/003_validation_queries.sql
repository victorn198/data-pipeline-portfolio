select count(*) as repository_count
from raw.github_repositories;

select
    activity_status,
    count(*) as repositories,
    sum(stars) as total_stars,
    sum(open_issues) as open_issues
from mart.vw_powerbi_repositories
group by activity_status
order by repositories desc;

select
    language,
    count(*) as repositories,
    sum(stars) as total_stars
from mart.vw_powerbi_repositories
group by language
order by total_stars desc;
