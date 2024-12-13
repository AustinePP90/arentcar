package com.apple.arentcar.service;

import com.apple.arentcar.dto.BranchsRegionNamesOptionDTO;
import com.apple.arentcar.dto.BranchsSearchDTO;
import com.apple.arentcar.dto.ChartDataDTO;
import com.apple.arentcar.mapper.BranchsMapper;
import com.apple.arentcar.model.Branchs;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BranchsService {

    @Autowired
    private BranchsMapper branchsMapper;

    // 모든 지점 조회
    public List<Branchs> findAllBranches() {
        return branchsMapper.findAllBranches();
    }

    // 지점명 조회
    public List<Branchs> findBranchsByBranchName(String branchName) {
        return branchsMapper.findBranchsByBranchName(branchName);
    }

    // 차트에 넣을 지점 데이터 조회
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

    // 전체 차종 수 조회(검색 기능 포함)
    public int countBranchByName(String branchName) {
        return branchsMapper.countBranchByName(branchName);
    }

    // 전체 지점 수 조회
    public int countAllBranchs() {
        return branchsMapper.countAllBranchs();
    }

    // 지점 추가
    public Branchs createBranchs(Branchs branchs) {
        branchsMapper.createBranchs(branchs);
        return branchs;
    }

    // 지점 추가 시 지점명 중복 검증
    public boolean isBranchNameDuplicate(String branchName) {
        int count = branchsMapper.duplicateCountByBranchName(branchName);
        // 중복된 이름이 있다면 true 반환
        return count > 0;
    }

    // <select>의 <option>값으로 지역이름 동적으로 불러오기
    public List<BranchsRegionNamesOptionDTO> getRegionCodeName() {
        return branchsMapper.getRegionCodeName();
    }

    // 지점 수정
    public void updateBranchsById(BranchsSearchDTO branchsSearchDTO) {
        branchsMapper.updateBranchsById(branchsSearchDTO);
    }

    // 지점 삭제
    public void deleteBranchsById(Integer branchCode) {
        branchsMapper.deleteBranchsById(branchCode);
    }

    // 지점 상세
    public BranchsSearchDTO getBranchsDetailById(Integer branchCode) {
        return branchsMapper.getBranchsDetailById(branchCode);
    }
}