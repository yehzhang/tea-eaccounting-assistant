import sqlite3
from aiohttp import web
import json
from time import gmtime, strftime


async def handle(request):
    print(request, 'from', request.remote)

    item_type_id = request.match_info['item_type_id']
    c = db_conn.cursor()
    result = fetch_orders(c, item_type_id)
    if result is None:
        return web.json_response({
            'error': 'Unknown item_type_id',
        })

    orders, fetched_at = result
    return web.json_response({
        'orders':     orders,
        'fetched_at': fetched_at,
    })


def fetch_orders(c, item_type_id):
    result = c.execute('''
      select fetched_at
      from market_order
      where item_type_id = ?
      order by fetched_at desc
      limit 1
    ''', (item_type_id,)).fetchone()
    if result is None:
        return None

    fetched_at = result['fetched_at']
    result = c.execute('''
      select price
           , remaining_volume
           , solar_system_id
           , station_id
           , bid
      from market_order
      where item_type_id = :item_type_id
        and fetched_at = :fetched_at
      order by price
    ''', (item_type_id, fetched_at)).fetchall()

    fetched_at += strftime("%z", gmtime())

    return result, fetched_at


def main():
    web.run_app(app, port=8000)


app = web.Application()
app.add_routes([
    web.get(r'/{item_type_id:\d+}', handle),
])


def dict_row_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        column_name = col[0]
        cell = row[idx]
        if column_name == 'solar_system_id':
            column_name = 'solar_system_name'
            cell = solar_system_names.get(str(cell))
        d[column_name] = cell
    return d


db_conn = sqlite3.connect('file:./eve_echoes.db?mode=ro', uri=True)
db_conn.row_factory = dict_row_factory

with open('../generated/universeNames.json') as f:
    solar_system_names = json.load(f)

if __name__ == '__main__':
    main()
