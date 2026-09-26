from fastapi import APIRouter

from app.movies.router import router as movies_router
from app.reviews.router import movie_reviews_router, reviews_router

api_router = APIRouter()

# Registre aqui os routers de cada domínio.
api_router.include_router(movies_router, prefix="/movies", tags=["movies"])
api_router.include_router(
    movie_reviews_router, prefix="/movies/{sk_movie_id}/reviews", tags=["reviews"]
)
api_router.include_router(reviews_router, prefix="/reviews", tags=["reviews"])
