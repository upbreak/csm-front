import { useEffect, useState } from "react";
import detail from "../../../../../assets/image/detail.png"
import plus from "../../../../../assets/image/plus.png"
import minus from "../../../../../assets/image/minus.png"
import dot from "../../../../../assets/image/dot.png"

const CodeList = ({ code, idx, level, pCode, expand, codeTrees, codeSet, dispatch, path }) => {
    const [isExpanded, setIsExpanded] = useState(expand);

    // 상세보기 클릭했을 경우
    const handleClick = () => {

        setIsExpanded(true) // 상세보기 클릭하면 코드분류 확장

        dispatch({ type: "path", path: path })
        dispatch({ type: "pCode", pCode: code})
    };

    // 코드분류 +/- 아이콘 클릭 시 코드트리 활성화/비활성화
    const handleAddClick = () => {
        setIsExpanded((prev) => !prev)
    }

    return (
        <>
            <div style={tdStyle}>
                <div style={{ marginLeft: `${(level) * 25}px` }}>

                    <div onClick={handleAddClick}>
                        {expand ?

                            (isExpanded ?
                                <img src={minus} style={{ width: "20px" }} alt="..." />
                                :
                                <img src={plus} style={{ width: "20px" }} alt="..." />
                            )
                            :
                            <img src={dot} style={{ width: "20px" }} alt="..." />
                        }
                    </div>
                </div>

                <div 
                    style={{ marginLeft: "5px", cursor:"pointer" }} 
                    onClick={handleClick} 
                >
                    {codeSet.code_nm}
                    { expand ?   
                        <img onClick={() => handleClick()} src={detail} style={{ height: "10px", marginLeft: "5px", paddingRight: "10px" }} alt=">>" />
                        :
                        null
                    }
                </div>
            </div>
            <hr style={{ margin: "5px" }}></hr>


            {isExpanded && codeTrees && codeTrees.map((codeTree, index) => (
                <CodeList
                    key={index}
                    code={codeTree.code}
                    idx={codeTree.idx}
                    level={codeTree.level}
                    pCode={codeTree.p_code}
                    expand={codeTree.expand}
                    codeTrees={codeTree.code_trees}
                    codeSet={codeTree.code_set}
                    dispatch={dispatch}
                    path={`${path} \\ ${codeTree.code_set.code_nm}`}
                />
            ))}

        </>
    );
};

export default CodeList;

const tdStyle = {
    display: 'flex',
    paddingLeft: '10px',
}