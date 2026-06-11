import pytest


def test_list_keycaps_empty(client):
    response = client.get("/api/keycaps")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) == 0


def test_list_keycaps_with_color_scheme_filter(client):
    client.post(
        "/api/keycaps",
        json={
            "name": "测试键帽1",
            "brand": "GMK",
            "color_scheme": "Laser Red",
            "material": "ABS",
            "purchase_price": 999.99,
            "notes": "第一个测试键帽",
        },
    )
    client.post(
        "/api/keycaps",
        json={
            "name": "测试键帽2",
            "brand": "SA",
            "color_scheme": "Ocean Blue",
            "material": "PBT",
            "purchase_price": 1299.0,
            "notes": "第二个测试键帽",
        },
    )

    response = client.get("/api/keycaps", params={"color_scheme": "Laser"})
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["color_scheme"] == "Laser Red"
    assert data[0]["name"] == "测试键帽1"
    assert data[0]["brand"] == "GMK"
    assert data[0]["material"] == "ABS"
    assert data[0]["keyboard_build_count"] == 0


def test_create_keycap(client):
    payload = {
        "name": "GMK Laser",
        "brand": "GMK",
        "color_scheme": "Cyan Magenta",
        "material": "ABS",
        "purchase_price": 1100.0,
        "notes": "赛博朋克激光配色",
    }
    response = client.post("/api/keycaps", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "GMK Laser"
    assert data["brand"] == "GMK"
    assert data["color_scheme"] == "Cyan Magenta"
    assert data["material"] == "ABS"
    assert data["purchase_price"] == 1100.0
    assert data["notes"] == "赛博朋克激光配色"
    assert "id" in data
    assert isinstance(data["id"], int)
    assert "created_at" in data
    assert "updated_at" in data
    assert data["keyboard_build_count"] == 0


def test_update_keycap(client):
    create_response = client.post(
        "/api/keycaps",
        json={
            "name": "初始名称",
            "brand": "GMK",
            "color_scheme": "默认配色",
            "material": "ABS",
            "purchase_price": 800.0,
            "notes": "初始备注",
        },
    )
    keycap_id = create_response.json()["id"]

    update_payload = {
        "name": "GMK Olivia",
        "color_scheme": "Pink Dark",
        "purchase_price": 1350.0,
        "notes": "更新后的备注",
    }
    response = client.put(f"/api/keycaps/{keycap_id}", json=update_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == keycap_id
    assert data["name"] == "GMK Olivia"
    assert data["brand"] == "GMK"
    assert data["color_scheme"] == "Pink Dark"
    assert data["material"] == "ABS"
    assert data["purchase_price"] == 1350.0
    assert data["notes"] == "更新后的备注"


def test_update_keycap_not_found(client):
    response = client.put(
        "/api/keycaps/9999",
        json={"name": "不存在"},
    )
    assert response.status_code == 404


def test_delete_keycap(client):
    create_response = client.post(
        "/api/keycaps",
        json={
            "name": "待删除键帽",
            "brand": "SA",
            "color_scheme": "Retro",
            "material": "PBT",
            "purchase_price": 500.0,
            "notes": "即将删除",
        },
    )
    keycap_id = create_response.json()["id"]

    response = client.delete(f"/api/keycaps/{keycap_id}")
    assert response.status_code == 204
    assert response.text == ""

    get_response = client.get(f"/api/keycaps/{keycap_id}")
    assert get_response.status_code == 404


def test_delete_keycap_not_found(client):
    response = client.delete("/api/keycaps/9999")
    assert response.status_code == 404
