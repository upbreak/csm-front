import { useEffect, useReducer, useState } from "react";
import ReactPaginate from "react-paginate";
import Select from 'react-select';
import "../../../../../assets/css/Paginate.css";
import "../../../../../assets/css/Table.css";
import { Axios } from "../../../../../utils/axios/Axios";
import { dateUtil } from "../../../../../utils/DateUtil";
import Button from "../../../../module/Button";
import GridModal from "../../../../module/GridModal";
import Modal from "../../../../module/Modal";
import Loading from "../../../../module/Loading";
import NoticeReducer from "./NoticeReducer";
import { useAuth } from "../../../../context/AuthContext";
import Table from "../../../../module/Table";


/**
 * @description: 공지사항 CRUD
 * 
 * @author 작성자: 정지영
 * @created 작성일: 2025-02-18
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @usedComponents
 * - ReactPagination: 페이지
 * - Select: 선택 박스
 * - Button: 등록 버튼
 * - GridModal: 공지사항 상세, 추가, 수정
 * - Modal: 알림 모달
 * - Loading: 로딩
 * - Table: 테이블
 * 
 * @additionalInfo
 * - API: 
 *    Http Method - GET : /site-nm (현장데이터 조회), /notice (근태인식기 조회)
 *    Http Method - POST : /notice (근태인식기 추가)
 *    Http Method - PUT : /notice (근태인식기 수정)
 *    Http Method - DELETE :  /notice/${idx} (근태인식기 삭제)
 * - 주요 상태 관리: useReducer, useState
*/

const Notice = () => {

    const [state, dispatch] = useReducer(NoticeReducer, {
        notices: [],
        count: 0,
        selectList: {},
    });

    const { user } = useAuth();


    // [GridModal]
    const [data, setData] = useState([]);
    const [detail, setDetail] = useState([]);
    const [gridMode, setGridMode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isGetGridModal, setIsGetGridModal] = useState(false);
    const [isPostGridModal, setIsPostGridModal] = useState(false);

    // [Modal]
    const [isMod, setIsMod] = useState(true);
    const [modalText, setModalText] = useState("")
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [isValidation, setIsValidation] = useState(true);

    // [페이지]
    const [order, setOrder] = useState("");
    const [pageNum, setPageNum] = useState(1);
    const [rowSize, setRowSize] = useState(10);


    const options = [
        { value: 5, label: "5줄 보기" },
        { value: 10, label: "10줄 보기" },
        { value: 15, label: "15줄 보기" },
        { value: 20, label: "20줄 보기" },
    ]

    // [테이블]
    const columns = [
        { header: "순번", width: "10px", itemName: "row_num", bodyAlign: "center", isSearch: false, isOrder: false, isDate: false, isEllipsis: false },
        { header: "지역", width: "30px", itemName: "loc_code", bodyAlign: "center", isSearch: true, isOrder: true, isDate: false, isEllipsis: false },
        { header: "현장", width: "120px", itemName: "site_nm", bodyAlign: "left", isSearch: true, isOrder: true, isDate: false, isEllipsis: true },
        { header: "제목", width: "250px", itemName: "title", bodyAlign: "left", isSearch: true, isOrder: true, isDate: false, isEllipsis: true },
        { header: "등록자", width: "60px", itemName: "user_info", bodyAlign: "center", isSearch: true, isOrder: true, isDate: false, isEllipsis: true},
        { header: "등록일", width: "60px", itemName: "reg_date", bodyAlign: "center", isSearch: false, isOrder: true, isDate: true, isEllipsis: false, dateFormat: "format" },
    ]


    const defaultSearchValues = columns.reduce((acc, col) => {
        if (col.isSearch) acc[col.itemName] = "";
        return acc
    }, {});

    const [isSearchInit, setIsSearchInit] = useState(false);
    const [isSearchReset, setIsSearchReset] = useState(false);
    const [searchValues, setSearchValues] = useState(defaultSearchValues);
    const [activeSearch, setActiveSearch] = useState(
        columns.reduce((acc, col) => {
            if (col.isSearch) acc[col.itemName] = false;
            return acc;
        }, {})
    );


    // [GridModal]
    const gridGetData = [
        { type: "html", span: "full", label: "", value: "" },
        { type: "html", span: "full", label: "", value: "" },
        { type: "hidden", value: "" },
    ]

    const gridPostData = [
        { type: "text", span: "full", label: "제목", value: "" },
        { type: "select", span: "double", label: "현장", value: 0, selectName: "siteNm" },
        { type: "select", span: "double", label: "공개범위", value: 0, selectName: "visibility" },
        { type: "html", span: "full", label: "내용", vlaue: "" },
        { type: "hidden", value: "" },
    ]

    const getModeString = () => {
        switch (gridMode) {
            case "SAVE":
                return "저장";
            case "EDIT":
                return "수정";
            case "REMOVE":
                return "삭제";
            default:
                return "";
        }
    }

    // [테이블] 검색
    const handleTableSearch = () => {
        setIsSearchInit(true);
        getNotices();
    }

    // [테이블] 검색 단어 갱신
    const handleSearchChange = (field, value) => {
        setSearchValues(prev => ({
            ...prev,
            [field]: value
        }));
    }

    // [테이블] 검색 초기화
    const onClickSearchInit = () => {

        setSearchValues(defaultSearchValues);
        setActiveSearch(columns.reduce((acc, col) => {
            if (col.isSearch) acc[col.itemName] = false;
            return acc;
        }, {}));

        setIsSearchInit(false);
        setIsSearchReset(true);
    }

    // [테이블] 정렬 이벤트
    const handleSortChange = (newOrder) => {
        setOrder(newOrder);
    }

    // [테이블] 행의 개수 선택
    const onChangeSelect = (e) => {
        setRowSize(e.value);
        setPageNum(1);
    }

    // [테이블] 행 클릭 시 상세페이지 
    const onClickRow = (mode, noticeRow) => {
        setGridMode(mode);
        const notice = state.notices.filter(notice => notice.row_num === noticeRow);
        setData(notice);
        handleGetGridModal("DETAIL", ...notice);
    }


    // [데이터] 공지사항 전체 조회
    const getNotices = async () => {
        setIsLoading(true);

        const res = await Axios.GET(`/notice?page_num=${pageNum}&row_size=${rowSize}&order=${order}&&loc_code=${searchValues.loc_code}&site_nm=${searchValues.site_nm}&title=${searchValues.title}&user_info=${searchValues.user_info}`);

        if (res?.data?.result === "Success") {
            dispatch({ type: "INIT", notices: res?.data?.values?.notices, count: res?.data?.values?.count });
        } else if (res?.data?.result === "Failure") {
            setIsMod(false);
            setIsOpenModal(true);
        }
        setIsLoading(false);

    }

    // [GridModal-Post] 공지사항 수정, 등록
    const handlePostGridModal = (mode, notice) => {
        setGridMode(mode);

        const arr = [...gridPostData]

        // 수정을 저장하고 난 후에, value값이 초기화 되지 않는 문제 해결하기 위해 사용.
        if (mode === "SAVE") {
            arr[3].value = "";
        }

        if (mode === "EDIT") {
            arr[0].value = notice.title;
            arr[1].value = notice.sno;
            //            arr[2].value = notice.show_yn; // TODO: 공개범위 설정
            arr[3].value = notice.content;
            arr[4].value = notice.idx;

        }

        setDetail(arr);
        getSiteData();
        setIsPostGridModal(true);
    }

    // [GridModal-Get] 공지사항 상세
    const handleGetGridModal = (mode, notice) => {

        const arr = [...gridGetData]

        if (mode === "DETAIL") {
            arr[0].value = `
                        <div class="row mb-2">
                            <div class="col-md-1 fw-bold">제목</div>
                            <div class="col-md-10">${notice.title}</div>
                        </div>
                        <div class="row">
                            <div class="col-md-1 fw-bold">지역</div>
                            <div class="col-md-3">${notice.loc_code}</div>
                            <div class="col-md-1 fw-bold">현장</div>
                            <div class="col-md-6">${notice.site_nm}</div>
                        </div>
                        <div class="row mt-2">
                            <div class="col-md-1 fw-bold">등록자</div>
                            <div class="col-md-3">${notice.user_info}</div>
                            <div class="col-md-1 fw-bold">등록일</div>
                            <div class="col-md-3">${dateUtil.format(notice.reg_date, "yyyy-MM-dd")}</div>
                            ${dateUtil.format(notice.mod_date, "yyyy-MM-dd") !== "0001-01-01" ? `                                
                                <div class="col-md-1 fw-bold">수정일</div>
                                <div class="col-md-3 ">${dateUtil.format(notice.mod_date, "yyyy-MM-dd")}</div>
                            ` : ""}
                        </div>
                        `
            arr[1].value = `<div class="overflow-auto Scrollbar" style="white-space:pre; height: 28rem; padding: 0.5rem">${notice.content}</div>`;
            arr[2].value = notice.idx;
            // TODO: 권한 있는 사람에게만 수정 삭제 보이도록 고쳐야함.

        }

        setDetail(arr);
        setIsGetGridModal(true);

    }

    // [GridModal] gridMode props 변경 이벤트
    const onClickModeSet = (mode) => {
        setGridMode(mode)
    }

    // [GridModal] 삭제 이벤트
    const onClickGridModalDeleteBtn = async (item) => {
        setIsLoading(true);

        var idx;
        if (gridMode === "DETAIL") {
            idx = Number(item[2].value)
            setIsGetGridModal(false);
        } else {
            idx = Number(item[4].value)
            setIsPostGridModal(false);
        }
        const res = await Axios.DELETE(`notice/${idx}`)

        if (res?.data?.result === "Success") {
            // 성공 모달
            setIsMod(true);
            setIsOpenModal(true);
            getNotices();
        } else {
            // 실패 모달
            setIsMod(false);
            setIsOpenModal(true);
        }

        setGridMode("REMOVE")
        setIsLoading(false);

    }

    // [GridModal-Get] 공지사항 상세 X 버튼 클릭 이벤트
    const onClickGetGridModalExitBtn = () => {
        setDetail([]);
        setIsGetGridModal(false);
    }

    // [GridModal-Post] 닫기 버튼을 눌렀을 경우
    const onClickPostGridModalExitBtn = () => {
        setDetail([]);
        setIsPostGridModal(false);
    }

    // [GridModal-Post] 현장데이터 리스트 조회
    const getSiteData = async () => {
        setIsLoading(true);

        const res = await Axios.GET(`/site-nm`);

        if (res?.data?.result === "Success") {
            dispatch({ type: "SITE_NM", list: res?.data?.values?.list });
        }
        setIsLoading(false);
    }

    // [GridModal-Post] 저장 버튼을 눌렀을 경우
    const onClickModalSave = async (item, mode) => {

        setGridMode(mode);

        // 제목을 입력 안했을 경우 모달
        if (item[0].value === "") {
            setIsValidation(false);
            setModalText("제목을 입력해 주세요.");
            setIsOpenModal(true);
        }
        // 내용을 입력 안했을 경우 모달
        else if (item[3].value === "") {
            setIsValidation(false);
            setModalText("내용을 입력해 주세요.")
            setIsOpenModal(true);

        } else {
            setIsLoading(true);
            setIsValidation(true);

            const notice = {
                sno: Number(item[1].value) || 0,
                title: item[0].value || "",
                content: item[3].value || "",
                show_yn: "Y", //item[2].value || "Y",
                reg_uno: Number(user.uno) || 0,
                reg_user: user.userName || ""
            }

            let res;

            if (gridMode === "SAVE") {
                res = await Axios.POST(`/notice`, notice);
            } else {
                notice.idx = item[4].value;
                notice.mod_user = user.userName || "";
                notice.mod_uno = Number(user.uno) || 0;
                res = await Axios.PUT(`/notice`, notice);
            }

            if (res?.data?.result === "Success") {
                setIsMod(true);
                getNotices();

            } else {
                setIsMod(false);
            }

            setIsLoading(false);
            setDetail([]);
            setData([]);
            setIsPostGridModal(false);
            setIsOpenModal(true);
        }

    }

    // [페이지] > 이동 버튼 클릭 시
    const handlePageClick = ({ selected }) => {
        setPageNum(selected + 1);
    }

    // [테이블] 단어 검색 초기화 시
    useEffect(() => {
        if (isSearchReset) {
            getNotices();
            setIsSearchReset(false);
        }

    }, [isSearchReset])

    // [GridModal] 모드 변경 시
    useEffect(() => {
        if (gridMode === "EDIT") {
            setIsGetGridModal(false);
            handlePostGridModal("EDIT", data[0]);
        }
    }, [gridMode])

    // [페이지] 페이지, 행크기, 정렬 변경 시
    useEffect(() => {
        getNotices();
    }, [pageNum, rowSize, order])

    return (
        <div>
            <Loading isOpen={isLoading} />
            <GridModal
                isOpen={isGetGridModal}
                gridMode={gridMode}
                funcModeSet={onClickModeSet}
                editBtn={true}
                removeBtn={true}
                title={`공지사항 ${getModeString()}`}
                exitBtnClick={onClickGetGridModalExitBtn}
                detailData={detail}
                selectList
                saveBtnClick//={"저장 누를때"}
                removeBtnClick={onClickGridModalDeleteBtn}
            />
            <GridModal
                isOpen={isPostGridModal}
                gridMode={gridMode}
                funcModeSet={onClickModeSet}
                editBtn={true}
                removeBtn={true}
                title={`공지사항 ${getModeString()}`}
                exitBtnClick={onClickPostGridModalExitBtn}
                detailData={detail}
                selectList={state.selectList}
                saveBtnClick={onClickModalSave}
                removeBtnClick={onClickGridModalDeleteBtn}
                isCancle={false}
                isValidation={true}
            />
            <Modal
                isOpen={isOpenModal}
                title={isValidation ? (isMod ? "요청 성공" : "요청 실패") : "입력 오류"}
                text={isValidation ? (isMod ? "성공하였습니다." : "실패하였습니다.") : modalText}
                confirm={"확인"}
                fncConfirm={() => setIsOpenModal(false)}
            />

            <div>
                <div className="container-fluid px-4">
                    <h2 className="mt-4">공지사항</h2>
                    <ol className="breadcrumb mb-4">
                        <img className="breadcrumb-icon" src="/assets/img/icon-house.png" alt="..." />
                        <li className="breadcrumb-item active">공지사항</li>
                    </ol>

                    <div className="table-header">
                        <div className="table-header-left">
                            <Select
                                onChange={onChangeSelect}
                                options={options}
                                defaultValue={options.find(option => option.value === rowSize)}
                                placeholder={"몇줄 보기"}
                                style={{ width: "200px" }}
                            />
                        </div>

                        <div className="table-header-right">
                            {
                                isSearchInit ? <Button text={"초기화"} onClick={onClickSearchInit} /> : null
                            }
                            <Button text={"등록"} onClick={() => handlePostGridModal("SAVE")}></Button>
                        </div>
                    </div>

                    <div className="table-wrapper">
                        <div className="table-container">
                            <Table
                                columns={columns}
                                data={state.notices}
                                searchValues={searchValues}
                                onSearch={handleTableSearch}
                                onSearchChange={handleSearchChange}
                                activeSearch={activeSearch}
                                setActiveSearch={setActiveSearch}
                                resetTrigger={isSearchReset}
                                onSortChange={handleSortChange}
                                rowIndexName={"row_num"}
                                onClickRow={onClickRow}
                            />
                        </div>
                    </div>

                    {/* TODO: 페이지가 항상 아래 쪽에 위치하도록 */}
                    <div className="pagination-container">
                        <ReactPaginate
                            previousLabel={"<"}
                            nextLabel={">"}
                            breakLabel={"..."}
                            pageCount={Math.ceil(state.count / rowSize)}
                            marginPagesDisplayed={1}
                            pageRangeDisplayer={4}
                            onPageChange={handlePageClick}
                            containerClassName={"pagination"}
                            activeClassName={"active"}
                        />

                    </div>
                </div>
            </div>

        </div>

    );
}

export default Notice;