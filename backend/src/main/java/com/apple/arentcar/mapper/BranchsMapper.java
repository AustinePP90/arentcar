package com.apple.arentcar.mapper;

import com.apple.arentcar.dto.*;
import com.apple.arentcar.dto.BranchsSearchDTO;
import com.apple.arentcar.dto.ChartDataDTO;
import com.apple.arentcar.model.Branchs;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface BranchsMapper {

    // 유저 입장에서 모든 지점 조회
    @Select("SELECT * FROM branchs")
    List<Branchs> findAllBranches();

    List<Branchs> findBranchsByBranchName(@Param("branchname") String branchName);


    // 차트에 넣을 지점 데이터 조회
    List<ChartDataDTO> getBranchChartData(@Param("startDate") String startDate, @Param("endDate") String endDate);

    // 지점 조회 및 페이지네이션(검색 기능 포함)
    List<BranchsSearchDTO> getBranchsNameWithPaging(@Param("branchName") String branchName,
                                                    @Param("pageSize") int pageSize,
                                                    @Param("offset") int offset);

    // 지점 조회 및 페이지네이션
    List<BranchsSearchDTO> getBranchsWithPaging(@Param("pageSize") int pageSize, @Param("offset") int offset);

    // 전체 차종 수 조회(검색 기능 포함)
    int countBranchByName(@Param("branchName") String branchName);

    // 전체 차종 수 조회
    int countAllBranchs();

    // 지점 추가
    void createBranchs(Branchs branchs);

    // 중복된 지점명 카운트
    int duplicateCountByBranchName(@Param("branchName") String branchName);

    // <select>의 <option>값으로 지역이름 동적으로 불러오기
    List<BranchsRegionNamesOptionDTO> getRegionCodeName();

    // 지점 수정
    void updateBranchsById(BranchsSearchDTO branchsSearchDTO);

    // 지점 삭제
    void deleteBranchsById(@Param("branchCode") Integer branchCode);

    // 지점 상세
    BranchsSearchDTO getBranchsDetailById(@Param("branchCode") Integer branchCode);
}
