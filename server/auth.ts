import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { env } from './config.js';
import { rows } from './db.js';
import type { RowDataPacket } from 'mysql2';
export type SessionUser={id:number;email:string;name:string;role:'admin'|'viewer';mustChangePassword:boolean};
declare global{namespace Express{interface Request{user?:SessionUser}}}
const cookieOptions={httpOnly:true,sameSite:'strict' as const,secure:env.NODE_ENV==='production',path:'/',maxAge:8*60*60*1000};
export function setSession(res:Response,user:SessionUser){res.cookie('session',jwt.sign(user,env.JWT_SECRET,{expiresIn:'8h',issuer:'certvale'}),cookieOptions);res.cookie('csrf',randomBytes(24).toString('hex'),{...cookieOptions,httpOnly:false});}
export function clearSession(res:Response){res.clearCookie('session',cookieOptions);res.clearCookie('csrf',{...cookieOptions,httpOnly:false});}
export async function authenticate(req:Request,res:Response,next:NextFunction){try{const token=jwt.verify(req.cookies?.session,env.JWT_SECRET,{issuer:'certvale'})as SessionUser;const users=await rows<(RowDataPacket&{id:number;email:string;name:string;role:'admin'|'viewer';active:number;must_change_password:number})[]>('SELECT id,email,name,role,active,must_change_password FROM users WHERE id=? LIMIT 1',[token.id]);const user=users[0];if(!user||!user.active){clearSession(res);return res.status(401).json({error:'Usuário inativo ou inexistente.'});}req.user={id:user.id,email:user.email,name:user.name,role:user.role,mustChangePassword:Boolean(user.must_change_password)};next();}catch{clearSession(res);res.status(401).json({error:'Sessão inválida ou expirada.'});}}
export function requireAdmin(req:Request,res:Response,next:NextFunction){if(req.user?.role!=='admin')return res.status(403).json({error:'Acesso restrito a administradores.'});next();}
export function requirePasswordChanged(req:Request,res:Response,next:NextFunction){if(req.user?.mustChangePassword)return res.status(403).json({error:'Altere sua senha temporária para continuar.'});next();}
export function csrf(req:Request,res:Response,next:NextFunction){if(['GET','HEAD','OPTIONS'].includes(req.method))return next();const cookie=String(req.cookies?.csrf||'');const header=String(req.get('x-csrf-token')||'');if(!cookie||!header||cookie.length!==header.length||!timingSafeEqual(Buffer.from(cookie),Buffer.from(header)))return res.status(403).json({error:'Token de segurança inválido.'});next();}
