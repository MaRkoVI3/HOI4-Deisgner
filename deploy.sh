#!/usr/bin/env bash
# GeneralStaff Production Deployment Script
# Usage: ./deploy.sh [command]
# Commands: up, down, restart, logs, pull, build, certbot

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.prod"

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $*"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $*"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $*"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $*"
}

check_env_file() {
    if [[ ! -f "$ENV_FILE" ]]; then
        log_error "Environment file $ENV_FILE not found!"
        log_info "Copy .env.prod.template to $ENV_FILE and fill in your values:"
        log_info "  cp .env.prod.template $ENV_FILE"
        exit 1
    fi
}

check_ssl_certs() {
    if [[ ! -d "ssl" ]] || [[ ! -f "ssl/fullchain.pem" ]] || [[ ! -f "ssl/privkey.pem" ]]; then
        log_warning "SSL certificates not found in ./ssl/"
        log_info "You can either:"
        log_info "  1. Place your certificates in ./ssl/ (fullchain.pem and privkey.pem)"
        log_info "  2. Run './deploy.sh certbot' to obtain Let's Encrypt certificates"
        log_info "  3. Use a reverse proxy (Cloudflare, AWS ALB, etc.) for SSL termination"
    fi
}

cmd_up() {
    check_env_file
    check_ssl_certs
    log_info "Starting production services..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d
    log_success "Services started!"
    log_info "Run './deploy.sh logs' to view logs"
}

cmd_down() {
    log_info "Stopping production services..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down
    log_success "Services stopped!"
}

cmd_restart() {
    check_env_file
    log_info "Restarting production services..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" restart
    log_success "Services restarted!"
}

cmd_logs() {
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs -f --tail=100
}

cmd_pull() {
    log_info "Pulling latest images..."
    docker-compose -f "$COMPOSE_FILE" pull
    log_success "Images pulled!"
}

cmd_build() {
    check_env_file
    log_info "Building images..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build --no-cache
    log_success "Images built!"
}

cmd_certbot() {
    check_env_file
    log_info "Obtaining SSL certificates from Let's Encrypt..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" --profile certbot run --rm certbot
    log_success "Certificates obtained! Restarting nginx..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" restart nginx
}

cmd_status() {
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps
}

cmd_clean() {
    log_warning "This will remove all containers, networks, and volumes!"
    read -rp "Are you sure? (y/N) " -n 1
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down -v --remove-orphans
        docker system prune -f
        log_success "Cleanup complete!"
    else
        log_info "Cancelled."
    fi
}

# Main command dispatcher
case "${1:-}" in
    up)
        cmd_up
        ;;
    down)
        cmd_down
        ;;
    restart)
        cmd_restart
        ;;
    logs)
        cmd_logs
        ;;
    pull)
        cmd_pull
        ;;
    build)
        cmd_build
        ;;
    certbot)
        cmd_certbot
        ;;
    status)
        cmd_status
        ;;
    clean)
        cmd_clean
        ;;
    *)
        echo "Usage: $0 {up|down|restart|logs|pull|build|certbot|status|clean}"
        echo ""
        echo "Commands:"
        echo "  up        Start production services"
        echo "  down      Stop production services"
        echo "  restart   Restart production services"
        echo "  logs      Follow logs"
        echo "  pull      Pull latest base images"
        echo "  build     Build images from scratch"
        echo "  certbot   Obtain Let's Encrypt SSL certificates"
        echo "  status    Show service status"
        echo "  clean     Remove all containers, networks, and volumes"
        exit 1
        ;;
esac