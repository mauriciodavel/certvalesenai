import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { env } from './config.js';
export type SessionUser={id:number;email:string;name:string;role:'admin'|'viewer'};
declare global{namespace Express{interface Request{user?:SessionUser}}}
const cookieOptions={httpOnly:true,sameSite:'strict' as const,secure:env.NODE_ENV==='production',path:'/',maxAge:8*60*60*1000};
export function setSession(res:Response,user:SessionUser){res.cookie('session',jwt.sign(user,env.JWT_SECRET,{expiresIn:'8h',issuer:'certvale'}),cookieOptions);res.cookie('csrf',randomBytes(24).toString('hex'),{...cookieOptions,httpOnly:false});}
export function clearSession(res:Response){res.clearCookie('session',cookieOptions);res.clearCookie('csrf',{...cookieOptions,httpOnly:false});}
export function authenticate(req:Request,res:Response,next:NextFunction){try{req.user=jwt.verify(req.cookies?.session,env.JWT_SECRET,{issuer:'certvale'})as SessionUser;next();}catch{res.status(401).json({error:'Sessão inválida ou expirada.'});}}
export function requireAdmin(req:Request,res:Response,next:NextFunction){if(req.user?.role!=='admin')return res.status(403).json({error:'Acesso restrito a administradores.'});next();}
export function csrf(req:Request,res:Response,next:NextFunction){if(['GET','HEAD','OPTIONS'].includes(req.method))return next();const cookie=String(req.cookies?.csrf||'');const header=String(req.get('x-csrf-token')||'');if(!cookie||!header||cookie.length!==header.length||!timingSafeEqual(Buffer.from(cookie),Buffer.from(header)))return res.status(403).json({error:'Token de segurança inválido.'});next();}
