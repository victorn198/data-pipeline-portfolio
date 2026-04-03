from mcp_tools.mcp_server_fastapi import is_read_only_query


def test_read_only_query_allows_select_and_safe_cte() -> None:
    assert is_read_only_query("select * from marts.fct_sales")
    assert is_read_only_query(
        """
        with revenue as (
            select customer_id, sum(sales_amount) as revenue
            from marts.fct_sales
            group by customer_id
        )
        select * from revenue
        """
    )


def test_read_only_query_rejects_data_modifying_cte() -> None:
    assert not is_read_only_query(
        """
        with deleted_rows as (
            delete from raw.orders_raw
            where status = 'cancelled'
            returning order_id
        )
        select * from deleted_rows
        """
    )


def test_read_only_query_rejects_select_into_and_multi_statement() -> None:
    assert not is_read_only_query(
        "select * into scratch_orders from raw.orders_raw"
    )
    assert not is_read_only_query(
        "select * from raw.orders_raw; delete from raw.orders_raw"
    )
