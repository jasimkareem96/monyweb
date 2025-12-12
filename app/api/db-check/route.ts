import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Try to connect to database
    await prisma.$connect()
    
    // Try a simple query
    await prisma.user.count()
    
    return NextResponse.json({
      success: true,
      message: "قاعدة البيانات متصلة بنجاح",
    })
  } catch (error: any) {
    console.error("Database check error:", error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || "خطأ في الاتصال بقاعدة البيانات",
        code: error.code,
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

