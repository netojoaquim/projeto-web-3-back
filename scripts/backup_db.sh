#!/bin/bash
# Script para gerar backup do banco PostgreSQL dentro do Docker

# Nome do container do PostgreSQL
CONTAINER_NAME=postgres_container

# Nome do banco de dados
DB_NAME=ecommerce_db

# Caminho onde o backup será salvo
BACKUP_FILE=./backup.sql

# Gerando o backup
docker exec -t $CONTAINER_NAME pg_dump -U postgres -d $DB_NAME > $BACKUP_FILE

echo "Backup gerado com sucesso em $BACKUP_FILE"
