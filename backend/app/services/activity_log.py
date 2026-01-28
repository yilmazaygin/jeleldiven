from sqlalchemy.ext.asyncio import AsyncSession
from app.models.activity_log import ActivityLog


async def log_activity(
    db: AsyncSession,
    table_name: str,
    record_id: int,
    action: str,
    user_id: int,
    details: str = None
):
    log = ActivityLog(
        table_name=table_name,
        record_id=record_id,
        action=action,
        user_id=user_id,
        details=details
    )
    db.add(log)
    await db.commit()
