#!/bin/bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login -H "Content-Type: application/json" -d '{"username":"analista","password":"analista123"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "TOKEN: $TOKEN"
curl -s -H "Authorization: Bearer $TOKEN" "http://localhost:8080/api/v1/dashboard/resumen?estado=ACTIVA" -v 2>&1 | tail -20
