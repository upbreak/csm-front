import CodeList from "./CodeList"
import SubCodeList from "./SubCodeList"
import { Axios } from "../../../../../utils/axios/Axios"
import { useNavigate } from "react-router-dom";
import { useEffect, useReducer, useState } from "react";
import CodeReducer, { initialState } from "./CodeReducer";
import Loading from "../../../../module/Loading";

/**
 * @description: 코드 관리
 * 
 * @author 작성자: 정지영
 * @created 작성일: 2025-04-10
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @usedComponents
 * - 
 * 
 * @additionalInfo
 * - API: 
 *    Http Method - GET : /code/tree (코드트리 데이터 조회)
 * - 주요 상태 관리: CodeReducer
 */
const Code = () => {
    const navigate = useNavigate();
    const [state, dispatch] = useReducer(CodeReducer, initialState);
    const [treeData, setTreeData] = useState([]);
    const [isDataChange, setIsDataChange] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const codeSet = {
        level: 0,
        idx: 0,
        code: "",
        p_code: "",
        code_nm: "HOME",
        code_color: "",
        udf_val_03: "",
        udf_val_04: "",
        udf_val_05: "",
        udf_val_06: "",
        udf_val_07: "",
        sort_no: "",
        is_use: "Y",
        etc: ""
    }

    // codeTrees 데이터 가져오는 API
    const getData = async () => {
        setIsLoading(true)

        try {
             const res = await Axios.GET(`/code/tree?p_code=`)
              if (res.data?.result === "Success") {
                  setTreeData(res.data?.values?.code_trees)

              } else {
              }
              setIsDataChange(false)
              setIsLoading(false)
        } catch(err) {
            navigate("/error");
        } finally {
            setIsLoading(false)
        }

    }

    const getTreeData = async () => {

        setIsLoading(true)
        const res = await Axios.GET(`code/tree?p_code=${state.pCode === "root" ? "" : state.pCode}`) 

        if (res.data?.result === "Success") {
            const tree = {
                codeSet: state.codeSet ? state.codeSet : codeSet,
                codeTrees: res.data?.values?.code_trees
            }
            dispatch({type:"subCodeList", list:tree})
        }
        setIsLoading(false)

    }

    // 처음에 데이터 가져오기. 저장 시 가져오기
    useEffect(() => {
        if (isDataChange) {
            getData()         
        }
    }, [isDataChange])

    // 부모코드 변경 시, 하위코드 데이터 변경
    useEffect(() => {
        getTreeData()
    }, [state.pCode])

    return (
        <div>
            <Loading isOpen={isLoading} />
            <div className="container-fluid px-4">
                <ol className="breadcrumb mb-2 content-title-box">
                    <li className="breadcrumb-item content-title">코드 관리</li>
                    <li className="breadcrumb-item active content-title-sub">관리</li>

                    <li style={{ position: 'absolute', right: "2vw" }}>
                        <i className="fa-solid fa-bell"></i> 수정 및 추가는 하나씩만 가능합니다
                    </li>

                </ol>
                <div className="d-flex">

                    <div style={{ ...containerStyle }}>

                        <div style={headerStyle}>코드 분류</div>
                        <div style={{ ...contentStyle, width: "15vw" }}>
                            {
                                treeData?.length === 0 ? null :
                                    <CodeList
                                        key={-1}
                                        code={'root'}
                                        idx={-1}
                                        level={0}
                                        pCode={'HOME'}
                                        expand={true}
                                        codeTrees={treeData}
                                        codeSet={codeSet}
                                        dispatch={dispatch}
                                        path={""}
                                    ></CodeList>
                            }
                        </div>
                    </div>

                    <div style={{ ...containerStyle }}>
                        <div style={headerStyle}>하위 코드 상세</div>
                        <div style={{ ...contentStyle }}>
                            <SubCodeList
                                data={state.subCodeList}
                                dispatch={dispatch}
                                path={state.path}
                                funcRefreshData={() => { 
                                    setIsDataChange(true); 
                                    getTreeData() 
                                }}
                                pCode={state.pCode}
                            >
                            </SubCodeList>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Code;

const containerStyle = {
    border: '2px solid #a5a5a5',
    borderRadius: '10px',
    marginTop: "5px",
    marginRight: "15px",
    overFlow: "unset"

};

const headerStyle = {
    padding: '10px',
    marginBottom: '10px',
    borderRadius: '8px 8px 0px 0px',
    backgroundColor: "#004377",
    color: '#fff',
    textAlign: 'center',
    width: "100%",

}

const contentStyle = {
    margin: '0px',
    overflowX: 'auto',
    overflowY: 'auto',
}