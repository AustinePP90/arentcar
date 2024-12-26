package com.apple.arentcar.exception;

import org.apache.ibatis.exceptions.PersistenceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // 404 에러 처리 (자원 찾기 실패)
    @ExceptionHandler(com.apple.arentcar.exception.ResourceNotFoundException.class)
    public ResponseEntity<String> handleResourceNotFoundException(com.apple.arentcar.exception.ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

//    // 유효성 검사 실패 예외 처리
//    @ExceptionHandler(MethodArgumentNotValidException.class)
//    public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {
//        List<String> errors = ex.getBindingResult()
//                .getFieldErrors()
//                .stream()
//                .map(fieldError -> fieldError.getField() + " : " + fieldError.getDefaultMessage())
//                .collect(Collectors.toList());
//        ErrorResponse errorResponse = new ErrorResponse("유효성 검사 실패", ErrorCode.INVALID_INPUT_VALUE, errors);
//        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
//    }

    // 데이터 무결성 위반 예외 처리 (예: 중복된 키, 외래 키 제약 위반 등)
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolationException(DataIntegrityViolationException ex) {
        ErrorResponse errorResponse = new ErrorResponse(ex.getMessage(), ErrorCode.DATA_INTEGRITY_VIOLATION);
        log.warn("데이터 무결성 제약 조건 위반 : {}", ex.getMessage());
        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }

    // 그 외 데이터베이스 관련 예외 처리
    @ExceptionHandler({PersistenceException.class, SQLException.class})
    public ResponseEntity<ErrorResponse> handleOtherDatabaseExceptions(Exception ex) {
        ErrorResponse errorResponse = new ErrorResponse("데이터베이스 처리 오류가 발생했습니다.", ErrorCode.DATABASE_ERROR);
        log.error("데이터베이스 처리 오류 발생 : {}", ex.getMessage(), ex); // log.error 로 변경, 스택 트레이스 포함
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR); // 500 Internal Server Error
    }

    // URL 파라미터 타입 불일치 처리
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<String> handleMethodArgumentTypeMismatchException(MethodArgumentTypeMismatchException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Invalid parameter: " + ex.getName() + " should be of type " + ex.getRequiredType().getName());
    }

    // IllegalArgumentException 처리 (잘못된 인자가 전달될 경우)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgumentException(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Illegal argument: " + ex.getMessage());
    }

    // 인증/권한 부족 시 발생하는 예외 처리
    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<String> handleAccessDeniedException(org.springframework.security.access.AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: " + ex.getMessage());
    }

    // MyBatis 전용 시스템 예외 처리 (MyBatisSystemException 등)
    @ExceptionHandler(org.mybatis.spring.MyBatisSystemException.class)
    public ResponseEntity<String> handleMyBatisSystemException(org.mybatis.spring.MyBatisSystemException ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("MyBatis System Error: " + ex.getCause().getMessage());
    }

    // 중복 차량 번호 등록 예외 처리
    @ExceptionHandler(DuplicateCarNumberException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateCarNumberException(DuplicateCarNumberException ex) {
        ErrorResponse errorResponse = new ErrorResponse(ex.getMessage(), ErrorCode.DUPLICATE_CAR_NUMBER, ex.getDetails());
        log.warn("중복된 차량 번호 등록 시도 : {}", ex.getMessage());
        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }

    // PK로 차종/차량 존재 여부 검사 예외 처리
    @ExceptionHandler(CarNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleCarNotFoundException(CarNotFoundException ex) {
        ErrorResponse errorResponse = new ErrorResponse(ex.getMessage(),ErrorCode.NO_DATA_FOUND, ex.getDetails());
        log.warn("PK로 차종/차량 조회 실패 : {}", ex.getMessage());
        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    // 엑셀 파일 다운로드 예외 처리
    @ExceptionHandler(ExcelFileGenerationException.class)
    public ResponseEntity<ErrorResponse> handleExcelFileGenerationException(ExcelFileGenerationException ex) {
        ErrorResponse errorResponse = new ErrorResponse(ex.getMessage(), ErrorCode.EXCEL_GENERATION_FAILED);
        log.error("엑셀 파일 생성 실패 : {}", ex.getMessage(), ex);
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // 그 외 모든 예외 처리
    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGlobalException(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred: " + ex.getMessage());
    }
}
