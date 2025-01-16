import { ObjChk } from "../../utils/ObjChk";
import { useEffect } from "react";

// alert, confirm 을 위한 커스텀 modal창 모듈
// 기본제공되는 alert, confirm 또는 라이브러리는 일부 브라우저에서 작동을 안 하거나 에러가 발생한다고 함.
const Modal = ({isOpen, title, text, confirm, fncConfirm, cancel, fncCancel}) => {

    const scrollUnset = (e) => {
        document.body.style.overflow = 'unset';
        if(e.target.name == 'confirm'){
            fncConfirm();
        }else{
            fncCancel();
        }
    }

    useEffect(() => {
        if(isOpen){
            document.body.style.overflow = 'hidden';
        }else{            
            document.body.style.overflow = 'unset';
        }
    }, []);

    return(
        <div>
            {
                isOpen ?
                <div style={overlayStyle}>
                    <div style={modalStyle}>
                        {
                            ObjChk.all(title) ?
                            <></>
                            :
                            <h2 style={h2Style}>{title}</h2>
                        }
                        
                        <p style={pStyle}>{text}</p>
                        <div style={buttonDivStyle}>
                            {
                                ObjChk.all(confirm) ?
                                <></>
                                :
                                <button className="btn btn-primary" style={buttonStyle} onClick={scrollUnset} name="confirm">{confirm}</button>
                            }
                            {
                                ObjChk.all(cancel) ?
                                <></>
                                :
                                <button className="btn btn-primary" style={buttonStyle} onClick={scrollUnset} name="cancel">{cancel}</button>
                            }
                        </div>
                    </div>
                </div>
                : 
                <></>
            }
        </div>
    );
}

const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: '9999'
};
  
const modalStyle = {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    margin: '10px',
};

const h2Style = {
    minHeight: '50px',
}

const pStyle = {
    paddingTop: '5px',
    minHeight: '40px',
}

const buttonDivStyle = {
    display: 'flex',
    flex: '0 0 50%',
    textAlign: 'center',
}

const buttonStyle = {
    margin: '5px',
    width: '100%',
}

export default Modal;