package com.apple.arentcar.mapper;

import com.apple.arentcar.dto.AdminsLoginDTO;
import com.apple.arentcar.dto.BranchsSearchDTO;
import com.apple.arentcar.dto.ChartDataDTO;
import com.apple.arentcar.model.Branchs;
import com.apple.arentcar.model.Menus;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface BranchsMapper {

    // 유저 입장에서 모든 지점 조회
    List<Branchs> findAllBranches();

    // 차트에 넣을 지점 데이터 조회
    List<ChartDataDTO> getBranchChartData();

    // 지점 조회 및 페이지네이션(검색 기능 포함)
    List<BranchsSearchDTO> getBranchsNameWithPaging(@Param("branchName") String branchName,
                                                    @Param("pageSize") int pageSize,
                                                    @Param("offset") int offset);



    // 지점 조회 및 페이지네이션
    List<BranchsSearchDTO> getBranchsWithPaging(@Param("pageSize") int pageSize, @Param("offset") int offset);

    // 전체 지점 수 조회(검색 기능 포함)
    int countBranchByName(@Param("branchName") String branchName);

    // 전체 지점 수 카운팅
    int countAllBranchs();

    // 지점 상세
    BranchsSearchDTO getBranchsDetailById(@Param("branchCode") Integer branchCode);
}
