from __future__ import annotations

import os
from contextlib import contextmanager
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv
from mysql.connector.pooling import MySQLConnectionPool

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / '.env')
load_dotenv(BASE_DIR / '.env.example', override=False)


def build_db_config(include_database: bool = True) -> dict:
    config = {
        'host': os.getenv('MYSQL_HOST', '127.0.0.1'),
        'port': int(os.getenv('MYSQL_PORT', '3306')),
        'user': os.getenv('MYSQL_USER', 'root'),
        'password': os.getenv('MYSQL_PASSWORD', ''),
        'autocommit': False,
    }
    database = os.getenv('MYSQL_DATABASE', 'apicta_2026')
    if include_database:
        config['database'] = database
    return config


@lru_cache(maxsize=1)
def get_pool() -> MySQLConnectionPool:
    pool_size = int(os.getenv('MYSQL_POOL_SIZE', '5'))
    return MySQLConnectionPool(pool_name='apicta_pool', pool_size=pool_size, pool_reset_session=True, **build_db_config())


@contextmanager
def get_connection():
    connection = get_pool().get_connection()
    try:
        yield connection
    finally:
        connection.close()
