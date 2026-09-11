from app.main import app


def test_health_routes_exist():
    paths = {route.path for route in app.routes}
    assert "/health" in paths
    assert "/api/problems" in paths
    assert "/api/attempts/{attempt_id}/submit" in paths
