from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.database import get_db
from app.models import User, SupportTicket, SupportMessage
from app.schemas import SupportTicketCreate, SupportMessageCreate
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/v1/support", tags=["Support"])


@router.get("/tickets")
async def list_tickets(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SupportTicket)
        .where(SupportTicket.user_id == current_user.id)
        .order_by(SupportTicket.created_at.desc())
    )
    tickets = result.scalars().all()

    return {
        "tickets": [
            {
                "id": t.id,
                "subject": t.subject,
                "category": t.category,
                "status": t.status,
                "created_at": t.created_at.isoformat(),
                "updated_at": t.updated_at.isoformat(),
            }
            for t in tickets
        ],
        "total": len(tickets),
    }


@router.post("/tickets", status_code=status.HTTP_201_CREATED)
async def create_ticket(
    data: SupportTicketCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    ticket = SupportTicket(
        user_id=current_user.id,
        subject=data.subject,
        category=data.category,
    )
    db.add(ticket)
    await db.flush()

    message = SupportMessage(
        ticket_id=ticket.id,
        sender_id=current_user.id,
        message=data.message,
    )
    db.add(message)
    await db.commit()
    await db.refresh(ticket)

    return {
        "id": ticket.id,
        "subject": ticket.subject,
        "category": ticket.category,
        "status": ticket.status,
        "created_at": ticket.created_at.isoformat(),
    }


@router.get("/tickets/{ticket_id}")
async def get_ticket(
    ticket_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SupportTicket).where(
            SupportTicket.id == ticket_id,
            SupportTicket.user_id == current_user.id,
        )
    )
    ticket = result.scalar_one_or_none()

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"success": False, "error": {"code": "TICKET_NOT_FOUND", "message": "Ticket not found."}},
        )

    messages_result = await db.execute(
        select(SupportMessage)
        .where(SupportMessage.ticket_id == ticket_id)
        .order_by(SupportMessage.created_at)
    )
    messages = messages_result.scalars().all()

    return {
        "id": ticket.id,
        "subject": ticket.subject,
        "category": ticket.category,
        "status": ticket.status,
        "created_at": ticket.created_at.isoformat(),
        "messages": [
            {
                "id": m.id,
                "message": m.message,
                "sender_id": m.sender_id,
                "is_admin": m.is_admin,
                "created_at": m.created_at.isoformat(),
            }
            for m in messages
        ],
    }


@router.post("/tickets/{ticket_id}/messages")
async def add_message(
    ticket_id: str,
    data: SupportMessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SupportTicket).where(
            SupportTicket.id == ticket_id,
            SupportTicket.user_id == current_user.id,
        )
    )
    ticket = result.scalar_one_or_none()

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"success": False, "error": {"code": "TICKET_NOT_FOUND", "message": "Ticket not found."}},
        )

    message = SupportMessage(
        ticket_id=ticket_id,
        sender_id=current_user.id,
        message=data.message,
    )
    db.add(message)
    await db.commit()

    return {"success": True, "message_id": message.id}
