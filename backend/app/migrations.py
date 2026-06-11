from datetime import datetime

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import engine


def run_migrations(db: Session) -> None:
    _add_keycap_timestamps(db)


def _add_keycap_timestamps(db: Session) -> None:
    with engine.connect() as conn:
        result = conn.execute(
            text(
                "SELECT name FROM pragma_table_info('keycaps') "
                "WHERE name IN ('created_at', 'updated_at')"
            )
        )
        existing_columns = {row[0] for row in result.fetchall()}

        now = datetime.now().isoformat()

        if "created_at" not in existing_columns:
            conn.execute(
                text(
                    f"ALTER TABLE keycaps ADD COLUMN created_at DATETIME "
                    f"NOT NULL DEFAULT '{now}'"
                )
            )

        if "updated_at" not in existing_columns:
            conn.execute(
                text(
                    f"ALTER TABLE keycaps ADD COLUMN updated_at DATETIME "
                    f"NOT NULL DEFAULT '{now}'"
                )
            )

        conn.execute(
            text(
                f"UPDATE keycaps SET created_at = '{now}' "
                f"WHERE created_at IS NULL OR created_at = ''"
            )
        )
        conn.execute(
            text(
                f"UPDATE keycaps SET updated_at = '{now}' "
                f"WHERE updated_at IS NULL OR updated_at = ''"
            )
        )

        conn.commit()
