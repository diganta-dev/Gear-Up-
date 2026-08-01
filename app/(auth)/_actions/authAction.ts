"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt, { JwtPayload } from "jsonwebtoken"

type LoginState ={
    success:true,
    statusCode:number,
    message:string,
    data:{
        accessToken: string,
        refreshToken: string
    }
}

export  const loginAction = async (prevState : LoginState,formData: FormData) => {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const res = await fetch(`${process.env.BACKEND_API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    });
    const result = await res.json();
    console.log("=== LOGIN API RESPONSE ===", JSON.stringify(result, null, 2));
    if(result.success){
        const cookieStore = await cookies()
        const isProduction = process.env.NODE_ENV === "production";
        cookieStore.set("accessToken",result.data.accessToken,{httpOnly:true,secure:isProduction,maxAge:60*60*24,sameSite:'lax'})
        cookieStore.set("refreshToken",result.data.refreshToken,{httpOnly:true,secure:isProduction,maxAge:60*60*24*7,sameSite:'lax'})
        const decodedToken = jwt.decode(result.data.accessToken) as JwtPayload;
        if(decodedToken?.role === "ADMIN"){
            redirect('/admin-dashboard')
        }
        else if(decodedToken?.role === "CUSTOMER"){
            redirect('/dashboard')
        }
        else if(decodedToken?.role==="PROVIDER"){
            redirect('/provider-dashboard')
        }
        else{
            redirect('/login')
        } 
        
    }
    return result
}