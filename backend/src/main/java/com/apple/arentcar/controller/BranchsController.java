package com.apple.arentcar.controller;

import com.apple.arentcar.dto.BranchsRegionNamesOptionDTO;
import com.apple.arentcar.dto.BranchsSearchDTO;
import com.apple.arentcar.dto.ChartDataDTO;
import com.apple.arentcar.model.Branchs;
import com.apple.arentcar.service.BranchsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/arentcar")
public class BranchsController {

    @Autowired
    private BranchsService branchsService;

    @GetMapping("/user/branchs")
    public List<Branchs> findAllBranches () {
        return branchsService.findAllBranches();
    }

    // 지점명 찾기
    @GetMapping("/manager/branchs")
    public List<Branchs> findBranchsByBranchName(
            @RequestParam(name = "branchname") String branchName) {
        return branchsService.findBranchsByBranchName(branchName);
    }

    // 차트에 나타낼 지점 데이터 가져오기
    @GetMapping("/manager/branchs/reservation")
    public ResponseEntity<List<ChartDataDTO>> getBranchsChartData(@RequestParam String startDate, @RequestParam String endDate) {
        List<ChartDataDTO> chartDataDto = branchsService.getBranchChartData(startDate, endDate);
        return ResponseEntity.ok(chartDataDto);
    }

    // 지점 조회 및 페이지네이션(검색 기능 포함)
    @GetMapping("/manager/branchs/paged")
    public ResponseEntity<List<BranchsSearchDTO>> getBranchsWithPaging(
            @RequestParam(defaultValue="10") int pageSize, // 10
            @RequestParam (defaultValue="1") int pageNumber, // 기본 페이지 1
            @RequestParam(required = false) String branchName) {
        List<BranchsSearchDTO> branchNames;
        if (branchName != null && !branchName.isEmpty()) {
            branchNames = branchsService.getBranchsNameWithPaging(branchName, pageSize, pageNumber);
        } else {
            branchNames = branchsService.getBranchsWithPaging(pageSize, pageNumber);
        }
        return ResponseEntity.ok(branchNames);
    }

    // 전체 지점 수 조회 (검색 기능 포함)
    @GetMapping("/manager/branchs/count")
    public ResponseEntity<Integer> getTotalBranchsCount(@RequestParam(required = false) String branchName) {
        int count;
        if (branchName != null && !branchName.isEmpty()) {
            count = branchsService.countBranchByName(branchName);
        } else {
            count = branchsService.countAllBranchs();
        }
        return ResponseEntity.ok(count);
    }

    // 지점 상세보기
    @GetMapping("/manager/branchs/detail/{branchCode}")
    public BranchsSearchDTO getBranchsDetailById(@PathVariable("branchCode") Integer branchCode) {
        return branchsService.getBranchsDetailById(branchCode);
    }

    // 지점 추가
    @PostMapping("/manager/branchs")
    public ResponseEntity<Branchs> createBranchs(@RequestBody Branchs branchs) {
        Branchs savedBranchs = branchsService.createBranchs(branchs);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedBranchs);
    }

    // 지점 추가 시 지점명 중복 검증
    @GetMapping("/manager/branchs/check-duplicate")
    public ResponseEntity<Map<String, Boolean>> checkDuplicateBranchName(@RequestParam String branchName) {
        boolean isDuplicate = branchsService.isBranchNameDuplicate(branchName);
        Map<String, Boolean> response = new HashMap<>();
        response.put("isDuplicate", isDuplicate);
        return ResponseEntity.ok(response);
    }

    // <select>의 <option>값으로 지역이름 동적으로 불러오기
    @GetMapping("manager/branchs/option")
    public List<BranchsRegionNamesOptionDTO> getRegionCodeName() {
        return branchsService.getRegionCodeName();
    }

    // 지점 수정
    @PutMapping("/manager/branchs/{branchCode}")
    public ResponseEntity<Void> updateBranchsById(
            @PathVariable Integer branchCode,
            @RequestBody BranchsSearchDTO branchsSearchDTO) {
        branchsSearchDTO.setBranchCode(branchCode);

        branchsService.updateBranchsById(branchsSearchDTO);
        return ResponseEntity.noContent().build();
    }

    // 지점 삭제
    @DeleteMapping("/manager/branchs/{branchCode}")
    public ResponseEntity<Void> deleteBranchsById(
            @PathVariable Integer branchCode) {
        branchsService.deleteBranchsById(branchCode);
        return ResponseEntity.noContent().build();
    }


}
