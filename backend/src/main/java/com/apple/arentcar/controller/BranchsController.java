package com.apple.arentcar.controller;

import com.apple.arentcar.dto.BranchsSearchDTO;
import com.apple.arentcar.dto.ChartDataDTO;
import com.apple.arentcar.model.Branchs;
import com.apple.arentcar.model.Menus;
import com.apple.arentcar.service.BranchsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/arentcar")
public class BranchsController {

    @Autowired
    private BranchsService branchsService;

    // 모든 지점 가져오기 (유저 입장)
    @GetMapping("user/branches")
    public List<Branchs> findAllBranches () {
        return branchsService.findAllBranches();
    }

    // 차트에 나타낼 지점 데이터 가져오기
    @GetMapping("/manager/branchs/reservation")
    public ResponseEntity<List<ChartDataDTO>> getBranchsChartData() {
        List<ChartDataDTO> chartDataDto = branchsService.getBranchChartData();
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
}
