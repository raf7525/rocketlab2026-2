from fastapi import APIRouter

from app.reviews.router import router as reviews_router

api_router = APIRouter()

# Registre aqui os routers de cada domínio.
api_router.include_router(reviews_router, prefix="/movies/{sk_movie_id}/reviews", tags=["reviews"])
