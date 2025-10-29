#!/bin/bash
# Script para restaurar o banco PostgreSQL dentro do Docker a partir de backup.sql

# Nome do container do PostgreSQL
CONTAINER_NAME=postgres_container

# Nome do banco de dados
DB_NAME=ecommerce_db

# Caminho do arquivo de backup
BACKUP_FILE=./backup.sql

# Restaurando o banco
docker exec -i $CONTAINER_NAME psql -U postgres -d $DB_NAME < $BACKUP_FILE

echo "Banco restaurado com sucesso a partir de $BACKUP_FILE"
