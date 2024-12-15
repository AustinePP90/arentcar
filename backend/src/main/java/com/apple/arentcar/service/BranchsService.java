package com.apple.arentcar.service;

import com.apple.arentcar.dto.BranchsSearchDTO;
import com.apple.arentcar.dto.ChartDataDTO;
import com.apple.arentcar.mapper.BranchsMapper;
import com.apple.arentcar.model.Branchs;
import com.apple.arentcar.model.Menus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Service
public class BranchsService {

    @Autowired
    private BranchsMapper branchsMapper;

    // 유저 입장에서 모든 지점 조회
    public List<Branchs> findAllBranches() {
        return branchsMapper.findAllBranches();
    }

    // 차트에 넣을 지점명과 예약건수 조회
    public List<ChartDataDTO> getBranchChartData(String startDate, String endDate) {
        return branchsMapper.getBranchChartData(startDate, endDate);
    }

    // 지점 조회 및 페이지네이션 (검색 기능 포함)
    public List<BranchsSearchDTO> getBranchsNameWithPaging(String branchName,
                                                           int pageSize,
                                                           int pageNumber) {
        int offset = (pageNumber - 1) * pageSize;
        return branchsMapper.getBranchsNameWithPaging(branchName, pageSize, offset);
    }

    // 지점 조회 및 페이지네이션
    public List<BranchsSearchDTO> getBranchsWithPaging(int pageSize, int pageNumber) {
        int offset = (pageNumber - 1) * pageSize; // offset 계산 식
        return branchsMapper.getBranchsWithPaging(pageSize, offset);
    }

    // 전체 지점 수 조회(검색 기능 포함)
    public int countBranchByName(String branchName) {
        return branchsMapper.countBranchByName(branchName);
    }

    // 전체 지점 수 카운팅
    public int countAllBranchs() {
        return branchsMapper.countAllBranchs();
    }

    // 지점 상세
    public BranchsSearchDTO getBranchsDetailById(Integer branchCode) {
        return branchsMapper.getBranchsDetailById(branchCode);
    }
}