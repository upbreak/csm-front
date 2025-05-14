import React, { useEffect, useState } from "react"
import { useAuth } from "../../../../context/AuthContext";
import { Axios } from "../../../../../utils/axios/Axios";
import { useNavigate } from "react-router-dom";
import { ObjChk } from "../../../../../utils/ObjChk";
import { arrayMove, verticalListSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import { DndContext, pointerWithin } from '@dnd-kit/core';
import Modal from "../../../../module/Modal";
import TextInput from "../../../../module/TextInput";
import Toggle from "../../../../module/Toggle";
import Button from "../../../../module/Button"
import ColorInput from "../../../../module/ColorInput";
import Loading from "../../../../module/Loading";
import SortedTableRow from "./SortedTableRow";
/**
 * @description: 
 * 
 * @author 작성자: 정지영
 * @created 작성일: 2025-04-15
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @usedComponents
 * - Loading: 로딩 스피너
 * - Modal: 알림 모달
 * - Button: 각종 버튼
 * - Toggle: 사용 유무 토글
 * - TextInput: 텍스트 입력값
 * - ColorInput: 색깔 입력값(기본 검정)
 * - SortedTableRow: 드래그 정렬 이벤트 넣을 각 행
 * 
 * @additionalInfo
 * - API: 
 *    Http Method - GET : code/check?code={code} (코드ID 중복검사)
 *    Http Method - POST : /code (코드 수정)
 *    Http Method - DELETE :  /code/{idx} (코드 삭제)
 * - 라이브러리:
 *    @dnd-kit/sortable: 순서정렬 및 배열변경
 *    @dnd-kit/core: 드래그앤드롭 이벤트
 */

const SubCodeList = ({ data, dispatch, path, funcRefreshData, pCode }) => {

    const navigate = useNavigate();


    const [isLoading, setIsLoading] = useState(false);
    const [isAdd, setIsAdd] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editNo, setEditNo] = useState(-1);
    const [isSortNoEdit, setIsSortNoEdit] = useState(false);
    const [codeSet, setCodeSet] = useState({});
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [modalText, setModalText] = useState("")
    const [modalTitle, setModalTitle] = useState("")
    const [isConfirmButton, setIsConfirmButton] = useState(false);
    const [idx, setIdx] = useState(-1)
    const [codeTrees, setCodeTrees] = useState([]);

    const { user } = useAuth();

    // 코드추가 버튼 클릭 시
    const handleAddCode = () => {
        setIsAdd(true);
    }

    // 순서변경 버튼 클릭 시
    const handleSortNoChange = () => {
        setCodeTrees([...data[0].codeTrees]);
        setIsSortNoEdit(true);
    }

    // 순서 저장 Axios 요청
    const sortNoSave = async () => {

        setIsOpenModal(false);
        setIsConfirmButton(false);
        setIsLoading(true);
        try {
            const sortSet = [];
            codeTrees.map((codeTree, index) => (
                sortSet.push({ idx: codeTree.idx, sort_no: index })
            ));

            const res = await Axios.POST(`/code/sort`, sortSet);

            if (res?.data?.result === "Success") {

                // 데이터 초기화
                funcRefreshData();
            } else {
            }
            setIsSortNoEdit(false);
        } catch (err) {
            navigate("/error");
        } finally {
            setIsLoading(false);
        }

    }

    // 순서 저장 버튼 클릭 시
    const handleSortNoSave = () => {

        setIsOpenModal(true);
        setIsConfirmButton(true);
        setModalTitle("저장하시겠습니까?");
        setModalText("저장 시 현재 화면은 초기화 됩니다.");
    }


    // 초기 데이터 세팅
    const initCodeSet = (set) => {
        if (set === undefined) {

            const code = {
                level: 0,
                idx: 0,
                code: null,
                p_code: pCode,
                code_nm: null,
                code_color: null,
                udf_val_03: null,
                udf_val_04: null,
                udf_val_05: null,
                udf_val_06: null,
                udf_val_07: "",
                sort_no: null,
                is_use: 'Y',
                etc: "",
            };
            setCodeSet({ ...code });
        }
        else {
            setCodeSet({ ...set });
        }
    }

    // 데이터 추가 시 값 변경
    const onChangeTableData = (name, value) => {
        codeSet[name] = value;
    }

    // 저장 버튼 클릭 시
    const onCilckSaveButton = async () => {

        // 코드ID 미기입 시
        if (ObjChk.all(codeSet.code)) {
            setIsOpenModal(true);
            setIsConfirmButton(false);
            setModalTitle("입력 오류");
            setModalText("코드ID를 입력해 주세요.");
            return;
        }
        // 코드명 미기입 시
        else if (ObjChk.all(codeSet.code_nm)) {
            setIsOpenModal(true);
            setIsConfirmButton(false);
            setModalTitle("입력 오류");
            setModalText("코드명을 입력해 주세요.");
            return;
        } else if(!isEdit) { // 초기 생성 시에만 codeID 중복확인하도록 설정
            // codeID 중복 확인
            try {
                const res = await Axios.GET(`code/check?code=${codeSet.code}`);

                if (res?.data?.result === "Success") {
                    if (res?.data?.values) {
                        // true면 중복이라는 뜻
                        setIsOpenModal(true);
                        setIsConfirmButton(false);
                        setModalTitle("중복 오류");
                        setModalText("코드ID는 중복이 불가합니다. 다른 값을 입력해 주세요.");
                        return;
                    }

                // 중복 확인 실패한 경우
                } else {
                    setIsOpenModal(true);
                    setIsConfirmButton(false);
                    setModalTitle("서버에러");
                    setModalText("서버가 불안정합니다. 다시 시도해주세요.");
                    return;
                }
            } catch(err) {
                navigate("/error");
            }
        }

        // 저장하시겠습니까? 모달 띄우기 확인을 누를 경우 save 실행
        setIsOpenModal(true);
        setIsConfirmButton(true);
        setModalTitle("저장하시겠습니까?");
        setModalText("저장 시 현재 화면은 초기화됩니다.");

    }

    // 저장 확인을 누르면 실행되는 함수
    const save = async () => {
        setIsLoading(true);


        codeSet.reg_uno = user.uno
        codeSet.reg_user = user.userName
        codeSet.p_code = pCode
        
        const res = await Axios.POST("/code", codeSet)
        if (res?.data?.result === "Success") {
            setIsEdit(false)
            initCodeSet()
            // 화면 초기화하기
            funcRefreshData()


            } else {

            }
            setIsOpenModal(false);
            setIsConfirmButton(false);
        } catch(err) {
            navigate("/error");
        } finally {
            setIsLoading(false);
        }
    }

    // 삭제 확인을 누르면 실행되는 함수
    const deleteCode = async () => {
        setIsLoading(true);
        setIsOpenModal(false);

        if (idx === -1) {
            setIsOpenModal(true);
            setIsConfirmButton(false);
            setModalTitle("삭제 실패");
            setModalText("삭제에 실패했습니다.");

            setIsLoading(false);
            return;
        }

        try {
            const res = await Axios.DELETE(`/code/${idx}`);
            
            if (res?.data?.result === "Success") {
                setIsOpenModal(true);
                setIsConfirmButton(false);
                setModalTitle("삭제 성공");
                setModalText("삭제에 성공했습니다.");
                funcRefreshData();
            } else {
                setIsOpenModal(true);
                setIsConfirmButton(false);
                setModalTitle("삭제 실패");
                setModalText("삭제에 실패했습니다.");
            }
            setIdx(-1);
        } catch(err) {
            navigate("/error");
        } finally {
            setIsLoading(false);
        }
    }

    // 삭제 버튼 클릭 시
    const onCilckDeleteButton = (idx) => {
        // IDX로 삭제 API
        setIdx(idx);
        setIsOpenModal(true);
        setIsConfirmButton(true);
        setModalTitle("삭제하시겠습니까?");
        setModalText("삭제 시 영원히 복구 할 수 없습니다.");
    }

    // 취소 버튼 클릭 시
    const onCilckCancleButton = (mode) => {
        // 이전 값으로 돌려놓기. edit모드를 제거하면 될 것 같음.
        if (mode === "EDIT") {
            setIsEdit(false);
        }
        else if (mode === "ADD") {
            setIsAdd(false);
        }
        initCodeSet();
    }

    // 수정 버튼 클릭 시
    const onCilckEditButton = (no, data) => {
        initCodeSet(data);
        setIsEdit(true);
        setEditNo(no);
    }

    // 순서 변경 시 아이콘을 놓으면 배열 순서 변경
    const handleDragEnd = ({ active, over }) => {
        if (!over || !active || active.id.idx === over.id.idx) { return; }

        const oldIndex = codeTrees.findIndex(codeTree => codeTree.idx === active.id.idx);
        const newIndex = codeTrees.findIndex(codeTree => codeTree.idx === over.id.idx);
        if (oldIndex !== -1 && newIndex !== -1) {
            const newData = arrayMove(codeTrees, oldIndex, newIndex);
            setCodeTrees([...newData]);
        }
    }


    // 데이터가 변경 시 추가 테이블 삭제 및 순서변경모드 해제
    useEffect(() => {
        setIsAdd(false);
        setIsSortNoEdit(false);
        setEditNo(-1);
    }, [data])

    // 추가값 변경 시 
    useEffect(() => {

    }, [isAdd, isEdit, editNo, codeTrees])

    // 부모코드 변경 시, 하위코드 데이터 변경


    return <div style={{ margin: "0px 10px 10px 10px" }}>
        <Loading isOpen={isLoading} />
        <Modal
            isOpen={isOpenModal}
            title={modalTitle}
            text={modalText}
            confirm={isConfirmButton ? "확인" : null}
            fncConfirm={isEdit || isAdd ? save : (isSortNoEdit ? sortNoSave : deleteCode)}
            cancel={isConfirmButton ? "취소" : "확인"}
            fncCancel={() => setIsOpenModal(false)}
        >
        </Modal>
        <div style={{ ...headerStyle }}>
            <div>
                <i className="fa-solid fa-house"></i>
                {` HOME ${path}`}</div>
            <div>
                {
                    isSortNoEdit ?
                        <>
                            <Button text={"순서저장"} onClick={() => handleSortNoSave()}></Button>
                            <Button text={"변경취소"} onClick={() => setIsSortNoEdit(false)}></Button>
                        </>
                        :
                        <>
                            <Button text={"코드추가"} onClick={() => handleAddCode()}>코드추가</Button>
                            <Button text={"순서변경"} onClick={() => handleSortNoChange()}>순서변경</Button>
                        </>
                }
            </div>
        </div>
        <table>
            <thead>
                <tr>
                    <th style={{ width: "10px" }} >순서</th>
                    <th style={{ width: "25px" }}>코드ID</th>
                    <th style={{ width: "25px" }}>코드명</th>
                    <th style={{ width: "10px" }}>색깔</th>
                    <th style={{ width: "15px" }}>값1</th>
                    <th style={{ width: "15px" }}>값2</th>
                    <th style={{ width: "15px" }}>값3</th>
                    <th style={{ width: "15px" }}>값4</th>
                    <th style={{ width: "15px" }}>값5</th>
                    <th style={{ width: "30px" }}>비고</th>
                    <th style={{ width: "15px" }}>사용여부</th>
                    <th style={{ width: "20px" }}></th>
                </tr>
            </thead>
            <tbody>
                    <>
                        {data.map((codeData, codeIndex) => (
                            <React.Fragment key={codeIndex}>
                                {isSortNoEdit ?
                                    <DndContext collisionDetection={pointerWithin} onDragEnd={handleDragEnd}>
                                        <SortableContext items={codeTrees} strategy={verticalListSortingStrategy}>
                                            {
                                                codeTrees.map((item) => {
                                                    return <SortedTableRow key={item.idx} item={item}></SortedTableRow>
                                                })
                                            }
                                        </SortableContext>
                                    </DndContext>

                                    :
                                    <>
                                        { codeData?.codeTrees?.length === 0  && !isAdd ?
                                            <tr>
                                                <td colSpan={12} style={{ textAlign: 'center', padding: '10px' }}>등록된 하위 코드가 없습니다.</td>
                                            </tr>
                                            :
                                            codeData.codeTrees && codeData.codeTrees?.map((codeTree, index) => (
                                                isEdit && editNo === index ?
                                                    <tr key={index}>
                                                        <td className="center">{index + 1}</td>
                                                        <td>{codeTree.code_set?.code}</td>
                                                        <td><TextInput style={{ ...textInputStyle }} initText={codeTree.code_set.code_nm} setText={(value) => onChangeTableData("code_nm", value)} /></td>
                                                        <td><ColorInput style={{ ...colorInputStyle }} initColor={codeTree.code_set.code_color} setColor={(value) => onChangeTableData("code_color", value)} ></ColorInput> </td>
                                                        <td><TextInput style={{ ...textInputStyle }} initText={codeTree.code_set.udf_val_03} setText={(value) => onChangeTableData("udf_val_03", value)} /></td>
                                                        <td><TextInput style={{ ...textInputStyle }} initText={codeTree.code_set.udf_val_04} setText={(value) => onChangeTableData("udf_val_04", value)} /></td>
                                                        <td><TextInput style={{ ...textInputStyle }} initText={codeTree.code_set.udf_val_05} setText={(value) => onChangeTableData("udf_val_05", value)} /></td>
                                                        <td><TextInput style={{ ...textInputStyle }} initText={codeTree.code_set.udf_val_06} setText={(value) => onChangeTableData("udf_val_06", value)} /></td>
                                                        <td><TextInput style={{ ...textInputStyle }} initText={codeTree.code_set.udf_val_07} setText={(value) => onChangeTableData("udf_val_07", value)} /></td>
                                                        <td><TextInput style={{ ...textInputStyle }} initText={codeTree.code_set.etc} setText={(value) => onChangeTableData("etc", value)} /></td>
                                                        <td><Toggle style={{ justifyContent: 'center' }} initValue={codeTree.code_set.is_use === 'Y' ? true : false} onClickValue={(value) => onChangeTableData("is_use", value ? "Y" : "N")} /></td>
                                                        <td className="center">
                                                            <Button text={"저장"} style={{ ...buttonStyle }} onClick={() => onCilckSaveButton()}></Button>
                                                            <Button text={"취소"} style={{ ...buttonStyle }} onClick={() => onCilckCancleButton("EDIT")}></Button>
                                                        </td>
                                                    </tr>
                                                    :
                                                    <tr key={index}>
                                                        <td className="center">{index + 1}</td>
                                                        <td>{codeTree.code_set.code}</td>
                                                        <td>{codeTree.code_set.code_nm}</td>
                                                        <td style={{ justifyItems: 'center' }}> <div className="square" style={{ backgroundColor: `${codeTree.code_set.code_color}` }}></div></td>
                                                        <td>{codeTree.code_set.udf_val_03}</td>
                                                        <td>{codeTree.code_set.udf_val_04}</td>
                                                        <td>{codeTree.code_set.udf_val_05}</td>
                                                        <td>{codeTree.code_set.udf_val_06}</td>
                                                        <td>{codeTree.code_set.udf_val_07}</td>
                                                        <td>{codeTree.code_set.etc}</td>
                                                        <td className="center">{codeTree.code_set.is_use}</td>
                                                        <td className="center">
                                                            <Button text={"수정"} style={{ ...buttonStyle }} onClick={() => onCilckEditButton(index, codeTree.code_set)}></Button>
                                                            <Button text={"삭제"} style={{ ...buttonStyle }} onClick={() => onCilckDeleteButton(codeTree.idx)}></Button>
                                                        </td>
                                                    </tr>
                                            ))
                                        }

                                        {isAdd ?
                                            <tr>
                                                <td className="center">{data[0] && data[0]?.codeTrees.length !== 0 ? data[0]?.codeTrees?.length + 1 : "1"}</td>
                                                <td><TextInput style={{ ...textInputStyle }} initText={""} setText={(value) => onChangeTableData("code", value)} /></td>
                                                <td><TextInput style={{ ...textInputStyle }} initText={""} setText={(value) => onChangeTableData("code_nm", value)} /></td>
                                                <td><ColorInput style={{ ...colorInputStyle }} initColor={""} setColor={(value) => onChangeTableData("code_color", value)} /></td>
                                                <td><TextInput style={{ ...textInputStyle }} initText={""} setText={(value) => onChangeTableData("udf_val_03", value)} /></td>
                                                <td><TextInput style={{ ...textInputStyle }} initText={""} setText={(value) => onChangeTableData("udf_val_04", value)} /></td>
                                                <td><TextInput style={{ ...textInputStyle }} initText={""} setText={(value) => onChangeTableData("udf_val_05", value)} /></td>
                                                <td><TextInput style={{ ...textInputStyle }} initText={""} setText={(value) => onChangeTableData("udf_val_06", value)} /></td>
                                                <td><TextInput style={{ ...textInputStyle }} initText={""} setText={(value) => onChangeTableData("udf_val_07", value)} /></td>
                                                <td><TextInput style={{ ...textInputStyle }} initText={""} setText={(value) => onChangeTableData("etc", value)} /></td>
                                                <td><Toggle style={{ justifyContent: 'center' }} initValue={"Y"} onClickValue={(value) => onChangeTableData("is_use", value ? "Y" : "N")} /></td>
                                                <td className="center">
                                                    <Button text={"저장"} style={{ ...buttonStyle }} onClick={() => {
                                                        // 부모코드 넣기 및 정렬순서 추가
                                                        onChangeTableData("p_code", data[0]?.codeSet?.code)
                                                        onChangeTableData("sort_no", data[0]?.codeTrees.length !== 0 ? data[0]?.codeTrees.length + 1 : 1)
                                                        // 저장
                                                        onCilckSaveButton()
                                                    }}>
                                                    </Button>
                                                    <Button text={"취소"} style={{ ...buttonStyle }} onClick={() => onCilckCancleButton("ADD")}></Button>
                                                </td>
                                            </tr>
                                            :
                                            null
                                        }
                                    </>
                                }

                            </React.Fragment>
                        ))
                        }
                    </>
            </tbody>
        </table>
    </div>
}
export default SubCodeList;


const buttonStyle = {
    padding: "3px 5px",
    fontSize: "14px",
}

const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    margin: "0px 10px 5px 5px",
}

const textInputStyle = {
    width: "100%",
    textAlign: "left",
}

const colorInputStyle = {
    width: "30px",
    height: "25px",
}