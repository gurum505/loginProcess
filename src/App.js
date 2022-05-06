import React from "react";
import { useRef, useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";

const Container = styled.div`
  margin-top: 100px;
  padding: 20px;
`;

const Input = styled.input`
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 40px;
  margin: 0 0 8px;
  padding: 5px 39px 5px 11px;
  border: solid 1px #dadada;
  background: #fff;
  box-sizing: border-box;
`;

const Button = styled.div`
  font-size: 18px;
  font-weight: 700;
  line-height: 49px;
  display: block;
  width: 100%;
  height: 49px;
  margin: 16px 0 7px;
  cursor: pointer;
  text-align: center;
  color: #fff;
  border: none;
  border-radius: 0;
  background-color: #03c75a;
  ${({ disabled }) =>
    disabled &&
    `
    background-color: #efefef;
  `}
`;

const JWT_EXPIRY_TIME = 24 * 3600 * 1000; // 만료 시간 (24시간 밀리 초로 표현)

//회원가입
const onLogin = (id, password) => {
    const data = {
        id,
        password,
    };

    console.log("Data",data);
    
    axios.post('/users', data)
        // .then(onLoginSuccess)
        .catch(error => {
            console.log("onLogin Error");
        });
}

const onSilentRefresh = (id, password) => {
    const data = {
      id,
      password,
    };
    axios.post('/refresh-users', data)
        .then(onLoginSuccess)
        .catch(error => {
            console.log("refresh-users failed")
        });
}

const onLoginSuccess = data => {
    // console.log("data",data);
    const { accessToken } = data;

    // accessToken 설정
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    // accessToken 만료하기 1분 전에 로그인 연장24 * 3600 * 1000
    setTimeout(onSilentRefresh, 5000);

    console.log("login success");
}

const fetchLogin = async ({id,password}) => { 
  const response = await fetch("http://localhost:4000/users");
  if(response.ok){
    const users= await response.json();

    const user= users.find((user)=>user.id==id);
    if(!users || user.password !== password){
      throw new Error("아이디 또는 비밀번호가 일치하지 않습니다.");
    }
    onLoginSuccess(user);
    return user;

  }
  throw new Error("서버연결이 되지 않았습니다.")
}

function App() {
  const id=useRef();
  const pwd=useRef();

  const onLoginBtn=()=>{
    console.log("loginBtn");
    onLogin(id.current.value,pwd.current.value);
  }

  const { User, setUser } = useState();
  const navigate=useNavigate();

  // const [account, setAccount]=useState({
  //   id:"",
  //   password:""
  // })

  //input에 입력하면 자동적으로 account state값 변경
  // const onChangeAccount = (e) => { 
  //   //account의 복사본을 만들고
  //   //input에 지정한 네임속성에 해당 value값을 오버라이딩
  //   setAccount({
  //     ...account,
  //     [e.target.name]:e.target.value,
  //   });
  //  }

  //동기식으로 로그인정보를 통신해서 출력
  const onSubmitAccount = async () => { 
    try{
      const user=await fetchLogin({
        id:id.current.value,
        password:pwd.current.value
      });
      console.log("user: ",user);
      window.alert("Login success");

    }catch(error){
      window.alert(error);
    }
  }

  return (
    <Container>
    <Input id="id" name="id" placeholder="아이디를 입력해주세요" ref={id} />
    <Input
      id="password"
      name="password"
      type="password"
      placeholder="비밀번호를 입력해주세요"
      ref={pwd}
    />
    <Button onClick={onSubmitAccount}>로그인</Button>
    <Button onClick={onLoginBtn}>회원가입</Button>
    </Container>
  );
}

export default App;
