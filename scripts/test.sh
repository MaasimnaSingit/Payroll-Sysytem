#!/bin/bash

# TGPS Payroll System Test Script
# Usage: ./test.sh [all|employee|admin|ph|data|errors|mobile]

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test data
TEST_EMPLOYEE_DATA='{
  "first_name": "Juan",
  "last_name": "Dela Cruz",
  "email": "juan@test.com",
  "phone": "+639171234567",
  "sss_no": "1234567890",
  "philhealth_no": "123456789012",
  "pagibig_no": "1234567890",
  "tin_no": "123456789"
}'

# Logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Test employee portal
test_employee_portal() {
    log "Testing Employee Portal..."
    
    # Test login
    curl -s -X POST "http://localhost:8080/api/auth/employee/login" \
         -H "Content-Type: application/json" \
         -d '{"email":"juan@test.com","password":"test123"}' || error "Login failed"
    
    # Test clock in
    curl -s -X POST "http://localhost:8080/api/attendance/clock-in" \
         -H "Authorization: Bearer $TOKEN" || error "Clock in failed"
    
    # Test leave request
    curl -s -X POST "http://localhost:8080/api/leave/request" \
         -H "Authorization: Bearer $TOKEN" \
         -d '{"type":"SL","start_date":"2024-01-01","end_date":"2024-01-02"}' || error "Leave request failed"
    
    log "Employee Portal tests completed"
}

# Test admin system
test_admin_system() {
    log "Testing Admin System..."
    
    # Test employee management
    curl -s -X POST "http://localhost:8080/api/employees" \
         -H "Authorization: Bearer $ADMIN_TOKEN" \
         -d "$TEST_EMPLOYEE_DATA" || error "Employee creation failed"
    
    # Test payroll processing
    curl -s -X POST "http://localhost:8080/api/payroll/calculate" \
         -H "Authorization: Bearer $ADMIN_TOKEN" \
         -d '{"period_start":"2024-01-01","period_end":"2024-01-15"}' || error "Payroll calculation failed"
    
    # Test leave management
    curl -s -X PUT "http://localhost:8080/api/leave/1/approve" \
         -H "Authorization: Bearer $ADMIN_TOKEN" || error "Leave approval failed"
    
    log "Admin System tests completed"
}

# Test PH compliance
test_ph_compliance() {
    log "Testing PH Compliance..."
    
    # Test SSS calculation
    curl -s -X POST "http://localhost:8080/api/ph/calculate/sss" \
         -H "Authorization: Bearer $ADMIN_TOKEN" \
         -d '{"salary":20000}' || error "SSS calculation failed"
    
    # Test PhilHealth calculation
    curl -s -X POST "http://localhost:8080/api/ph/calculate/philhealth" \
         -H "Authorization: Bearer $ADMIN_TOKEN" \
         -d '{"salary":20000}' || error "PhilHealth calculation failed"
    
    # Test Pag-IBIG calculation
    curl -s -X POST "http://localhost:8080/api/ph/calculate/pagibig" \
         -H "Authorization: Bearer $ADMIN_TOKEN" \
         -d '{"salary":20000}' || error "Pag-IBIG calculation failed"
    
    # Test BIR calculation
    curl -s -X POST "http://localhost:8080/api/ph/calculate/tax" \
         -H "Authorization: Bearer $ADMIN_TOKEN" \
         -d '{"salary":20000,"period":"monthly"}' || error "Tax calculation failed"
    
    log "PH Compliance tests completed"
}

# Test data persistence
test_data_persistence() {
    log "Testing Data Persistence..."
    
    # Create test data
    local EMPLOYEE_ID=$(curl -s -X POST "http://localhost:8080/api/employees" \
                            -H "Authorization: Bearer $ADMIN_TOKEN" \
                            -d "$TEST_EMPLOYEE_DATA" | jq -r '.id')
    
    # Verify creation
    curl -s "http://localhost:8080/api/employees/$EMPLOYEE_ID" \
         -H "Authorization: Bearer $ADMIN_TOKEN" || error "Data read failed"
    
    # Update data
    curl -s -X PUT "http://localhost:8080/api/employees/$EMPLOYEE_ID" \
         -H "Authorization: Bearer $ADMIN_TOKEN" \
         -d '{"first_name":"Juan Updated"}' || error "Data update failed"
    
    # Verify update
    curl -s "http://localhost:8080/api/employees/$EMPLOYEE_ID" \
         -H "Authorization: Bearer $ADMIN_TOKEN" || error "Updated data read failed"
    
    log "Data Persistence tests completed"
}

# Test error handling
test_error_handling() {
    log "Testing Error Handling..."
    
    # Test invalid login
    local RESPONSE=$(curl -s -X POST "http://localhost:8080/api/auth/login" \
                         -H "Content-Type: application/json" \
                         -d '{"email":"invalid","password":"invalid"}')
    
    if [[ ! "$RESPONSE" =~ "error" ]]; then
        error "Error handling failed for invalid login"
    fi
    
    # Test invalid employee creation
    local RESPONSE=$(curl -s -X POST "http://localhost:8080/api/employees" \
                         -H "Authorization: Bearer $ADMIN_TOKEN" \
                         -d '{"invalid":"data"}')
    
    if [[ ! "$RESPONSE" =~ "error" ]]; then
        error "Error handling failed for invalid employee data"
    fi
    
    log "Error Handling tests completed"
}

# Test mobile experience
test_mobile_experience() {
    log "Testing Mobile Experience..."
    
    # Test viewport meta
    curl -s "http://localhost:8080/employee" | grep -q 'viewport' || error "Mobile viewport meta missing"
    
    # Test responsive CSS
    curl -s "http://localhost:8080/employee" | grep -q 'media' || error "Responsive CSS missing"
    
    log "Mobile Experience tests completed"
}

# Main test execution
main() {
    local TEST_TYPE=${1:-"all"}
    
    log "Starting TGPS Payroll System Tests: $TEST_TYPE"
    
    case $TEST_TYPE in
        "all")
            test_employee_portal
            test_admin_system
            test_ph_compliance
            test_data_persistence
            test_error_handling
            test_mobile_experience
            ;;
        "employee")
            test_employee_portal
            ;;
        "admin")
            test_admin_system
            ;;
        "ph")
            test_ph_compliance
            ;;
        "data")
            test_data_persistence
            ;;
        "errors")
            test_error_handling
            ;;
        "mobile")
            test_mobile_experience
            ;;
        *)
            error "Invalid test type. Use: all|employee|admin|ph|data|errors|mobile"
            ;;
    esac
    
    log "All tests completed successfully! 🎉"
}

# Execute tests
main "$@"
