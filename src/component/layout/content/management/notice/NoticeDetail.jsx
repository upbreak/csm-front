import { useEffect, useReducer, useState } from "react";
import { Axios } from "../../../../../utils/axios/Axios";
import { useAuth } from "../../../../context/AuthContext";
import { dateUtil } from "../../../../../utils/DateUtil";
import Modal from "../../../../module/Modal";
import NoticeReducer from "./NoticeReducer";
import Loading from "../../../../module/Loading";
import NoticeModal from "./NoticeModal";


/**
 * @description: 
 * 
 * @author 작성자: 정지영
 * @created 작성일: 2025-04-07
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @usedComponents
 * - 
 * 
 * @additionalInfo
 * - API: 
 *    Http Method - GET : /project/my-job_name/{uno} (프로젝트데이터 조회)
 *    Http Method - POST : /notice (공지사항 추가)
 *    Http Method - PUT : /notice (공지사항 수정)
 *    Http Method - DELETE :  /notice/${idx} (공지사항 삭제)
 */
const NoticeDetail = ( {notice, isDetail, setIsDetail} ) => {
    const [state, dispatch] = useReducer(NoticeReducer, {
        notices: [],
        count: 0,
        selectList: {},
    });

    const { user } = useAuth(); 

    // [GridModal]
    const [detail, setDetail] = useState([]);
    const [noticeData, setNoticeData] = useState([]);
    const [gridMode, setGridMode] = useState("DETAIL");
    const [isLoading, setIsLoading] = useState(false);
    const [isGridModal, setIsGridModal] = useState(false);
    const [isAuthorization, setIsAuthorization] = useState(true); //  FIXME: 나중에 권한 넣을 때는 false로 변경해야함.
    
    // [Modal]
    const [isMod, setIsMod] = useState(true);
    const [modalText, setModalText] = useState("")
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [isValidation, setIsValidation] = useState(true);

    const gridData = [
        { type: "text", span: "full", label: "제목", value: "" },
        { type: "date", span: "double", label: "시작일"},
        { type: "date", span: "double", label: "마감일"},
        { type: "select", span: "double", label: "프로젝트", value: 0, selectName: "projectNm" },
        { type: "checkbox", span: "double", label: "중요공지여부", value: "1" },
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

    // [GridModal-Post] 공지사항 수정, 등록
    const handlePostGridModal = (mode, notice) => {
        const arr = [...gridData]

        setGridMode( (mode === "COPY") ? "SAVE": mode)

        if (mode === "EDIT" || mode === "COPY") {
            arr[0].value = notice.title;
            arr[1].value = dateUtil.format(notice.posting_start_date);
            arr[2].value = dateUtil.format(notice.posting_end_date);
            arr[3].value = (mode === "COPY") ? -1 : Number(notice.jno);
            arr[4].value = notice.is_important;
            arr[5].value = notice.content;
            arr[6].value = Number(notice.idx);
        }
 
        // 수정을 저장하고 난 후에, value값이 초기화 되지 않는 문제 해결하기 위해 사용.
        if (mode === "SAVE") {
            arr[1].value = "-";
            arr[2].value = "-";
            arr[5].value = "";
        }

        setIsGridModal(true);
        setNoticeData(notice);
        setDetail(arr);
        getSiteData();
    }

    // [GridModal-Get] 공지사항 상세
    const handleGetGridModal = (mode, notice) => {
            setGridMode(mode)
            const arr = [...gridData]

            if (mode === "DETAIL") { 
                arr[0].value = notice.title;
                arr[1].value = dateUtil.format(notice.posting_start_date);
                arr[2].value = dateUtil.format(notice.posting_end_date);
                arr[3].value = Number(notice.jno);
                arr[4].value = notice.is_important;
                arr[5].value = notice.content;
                arr[6].value = Number(notice.idx);

                // FIXME: 수정 삭제 버튼 작성자만 볼 수 있도록
                // if (user.uno == notice.reg_uno) {
                //     setIsAuthorization(true);
                // }
    
            }
            setNoticeData(notice);
            setDetail(arr);
            setIsGridModal(true);
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
            idx = Number(item[6].value)
        } else {
            idx = Number(item[6].value)
        }
        const res = await Axios.DELETE(`notice/${idx}`)

        if (res?.data?.result === "Success") {
            // 성공 모달
            setIsMod(true);
            setIsOpenModal(true);
            setIsDetail(false);
        } else {
            // 실패 모달
            setIsMod(false);
            setIsOpenModal(true);
        }

        setGridMode("REMOVE");
        setIsGridModal(false);
        setIsLoading(false);

    }
    
     // [GridModal-Get] 공지사항 상세 X 버튼 클릭 이벤트
    const onClickGridModalExitBtn = () => {
            setDetail([]);
            setIsGridModal(false);
            setIsDetail(false)
        }
    
    // [GridModal-Post] 현장데이터 조회
    const getSiteData = async () => {
        setIsLoading(true);

        // FIXME : 관리자권한
        const res = await Axios.GET(`/project/my-job_name/${user.uno}?role=ADMIN`);

        if (res?.data?.result === "Success") {
            dispatch({ type: "PROJECT_NM", projectNm: res?.data?.values?.project_nm });
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
        else if (item[5].value === "") {
            setIsValidation(false);
            setModalText("내용을 입력해 주세요.")
            setIsOpenModal(true);

        } 
        // 프로젝트 지정 안했을 경우 모달
        else if (item[3].value === -1) {
            setIsValidation(false);
            setModalText("프로젝트를 선택해 주세요.");
            setIsOpenModal(true);
        }else if ( dateUtil.goTime(item[1].value) === "0001-01-01T00:00:00Z" ){
            setIsValidation(false);
            setModalText("게시시작일을 선택해 주세요.");
            setIsOpenModal(true);
        }else if ( dateUtil.goTime(item[2].value) === "0001-01-01T00:00:00Z" ){
            setIsValidation(false);
            setModalText("게시마감일을 선택해 주세요.");
            setIsOpenModal(true);
        }
        else {
            setIsLoading(true);
            setIsValidation(true);
            
            
            const notice = {
                jno: Number(item[3].value) || 0,
                title: item[0].value || "",
                content: item[5].value || "",
                is_important: item[4].value || "N",
                show_yn: "Y",
                posting_start_date: dateUtil.goTime(item[1].value) || "0001-01-01T00:00:00Z",
                posting_end_date: dateUtil.parseToGo(item[2].value) || "0001-01-01T00:00:00Z",
                reg_uno: Number(user.uno) || 0,
                reg_user: user.userName || "",
            }

            let res;

            if (gridMode === "SAVE") {
                res = await Axios.POST(`/notice`, notice);
            } else {
                notice.idx = Number(item[6].value);
                notice.mod_user = user.userName || "";
                notice.mod_uno = Number(user.uno) || 0;

                res = await Axios.PUT(`/notice`, notice);
            }

            if (res?.data?.result === "Success") {
                // Axios 요청 성공했을 경우
                setIsMod(true);
                setIsDetail(false);

            } else {
                // Axios 요청 실패했을 경우
                setIsMod(false);
                setIsDetail(false);
            }

            setIsLoading(false);
            setDetail([]);
            setIsGridModal(false);
            setIsOpenModal(true);
        }
    }

    // [GridModal] 모드 변경 시
    useEffect(() => {
        if (gridMode === "EDIT" ) {
            handlePostGridModal("EDIT", notice[0]);
        }
    }, [gridMode])

    // [GridModal] 수정 또는 디테일 모달 켜기
    useEffect(() => {
        if (isDetail === true && notice.length !== 0) {                    
            handleGetGridModal("DETAIL", notice[0]);
        } 
        else if (isDetail === true) {
            handlePostGridModal("SAVE")
        }
    }, [isDetail])

    return (
        <div>
            <Loading isOpen={isLoading} />
            <Modal
                isOpen={isOpenModal}
                title={isValidation ? (isMod ? "요청 성공" : "요청 실패") : "입력 오류"}
                text={isValidation ? (isMod ? "성공하였습니다." : "실패하였습니다.") : modalText}
                confirm={"확인"}
                fncConfirm={() => setIsOpenModal(false)}
            />
             <NoticeModal
                data={noticeData}
                isOpen={isGridModal}
                gridMode={gridMode}
                funcModeSet={onClickModeSet}
                editBtn={isAuthorization}
                removeBtn={isAuthorization}
                title={`공지사항 ${getModeString()}`}
                exitBtnClick={onClickGridModalExitBtn}
                detailData={detail}
                selectList={state.selectList}
                saveBtnClick={onClickModalSave}
                removeBtnClick={onClickGridModalDeleteBtn}
                isCancle={true}
                isCopy={true}
                copyBtnClick={(data) => {handlePostGridModal("COPY", noticeData)}}
            />
        </div>
        )
}

export default NoticeDetail;