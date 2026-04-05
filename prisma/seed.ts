import path from "path"
import { config } from "dotenv"

// Resolve .env from project root regardless of cwd when invoked by prisma CLI
config({ path: path.resolve(process.cwd(), ".env") })

import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import { hash } from "bcryptjs"
import { normalizeDatabaseUrl } from "../lib/database-url"

const rawConnectionString = process.env.DATABASE_URL
if (!rawConnectionString) throw new Error("DATABASE_URL is not set in .env")

const connectionString = normalizeDatabaseUrl(rawConnectionString)
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const categories = [
    {
        id: "cm9trhotcoffee0001menu001",
        name: "Sıcak Kahveler",
        slug: "sicak-kahveler",
        order: 1,
        image:
            "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80",
    },
    {
        id: "cm9tricedcoffee002menu002",
        name: "Buzlu Kahveler",
        slug: "buzlu-kahveler",
        order: 2,
        image:
            "https://images.unsplash.com/photo-1517701550927-30cf4ba1fcef?auto=format&fit=crop&w=1200&q=80",
    },
    {
        id: "cm9trfrappes0033menu003",
        name: "Frappeler",
        slug: "frappeler",
        order: 3,
        image:
            "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=1200&q=80",
    },
    {
        id: "cm9trbakery00444menu004",
        name: "Fırın Ürünleri & Tatlılar",
        slug: "firin-urunleri-ve-tatlilar",
        order: 4,
        image:
            "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=1200&q=80",
    },
] as const

const products = [
    {
        id: "cm9trprodmacchiato01menu01",
        categoryId: "cm9trhotcoffee0001menu001",
        name: "Karamel Macchiato",
        description:
            "Taze espresso, vanilya şurubu ve buharlanmış sütün, kadifemsi karamel sosuyla buluşması.",
        price: "115",
        order: 1,
        image:
            "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=1200&q=80",
    },
    {
        id: "cm9trprodwhitemocha2menu02",
        categoryId: "cm9trhotcoffee0001menu001",
        name: "Beyaz Çikolatalı Mocha",
        description:
            "Zengin espresso ve beyaz çikolata sosunun sütle uyumu, üzerinde krema ile.",
        price: "125",
        order: 2,
        image:
            "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=1200&q=80",
    },
    {
        id: "cm9trprodcoollime003menu",
        categoryId: "cm9tricedcoffee002menu002",
        name: "Cool Lime Refresha",
        description:
            "Misket limonu ve taze nane özlerinin buzla birleşen ferahlatıcı serinliği.",
        price: "105",
        order: 1,
        image:
            "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1200&q=80",
    },
    {
        id: "cm9trprodfrappe004menu0",
        categoryId: "cm9trfrappes0033menu003",
        name: "Çikolata Parçacıklı Frappe",
        description:
            "Kahve, süt ve çikolata parçacıklarının buzla harmanlanmış, krema süslemeli hali.",
        price: "145",
        order: 1,
        image:
            "https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&w=1200&q=80",
    },
    {
        id: "cm9trprodbrownie05menu0",
        categoryId: "cm9trbakery00444menu004",
        name: "Belçika Çikolatalı Brownie",
        description:
            "Gerçek Belçika çikolatasıyla hazırlanan yoğun ve yumuşak dokulu brownie.",
        price: "95",
        order: 1,
        image:
            "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1200&q=80",
    },
    {
        id: "cm9trprodmuffin006menu0",
        categoryId: "cm9trbakery00444menu004",
        name: "Yaban Mersinli Muffin",
        description:
            "İçi bol yaban mersinli, üzeri kıtır şeker kaplı yumuşacık muffin.",
        price: "85",
        order: 2,
        image:
            "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=1200&q=80",
    },
] as const

async function main() {
    const hashedPassword = await hash("admin123", 12)

    await prisma.user.upsert({
        where: { email: "admin@admin.com" },
        update: {},
        create: {
            email: "admin@admin.com",
            name: "Admin",
            password: hashedPassword,
        },
    })

    await prisma.settings.upsert({
        where: { id: "singleton" },
        update: {
            restaurantName: "MF Digital Cafe",
            slogan: "Şehrin ritmini taşıyan kahve ve tatlı deneyimi.",
            currencySymbol: "₺",
        },
        create: {
            id: "singleton",
            restaurantName: "MF Digital Cafe",
            slogan: "Şehrin ritmini taşıyan kahve ve tatlı deneyimi.",
            theme: "minimalist",
            currencySymbol: "₺",
        },
    })

    await prisma.campaign.upsert({
        where: { id: "singleton" },
        update: {},
        create: {
            id: "singleton",
            isBannerActive: false,
            isPopupActive: false,
        },
    })

    await prisma.product.deleteMany()
    await prisma.category.deleteMany({
        where: {
            slug: {
                in: categories.map((category) => category.slug),
            },
        },
    })

    for (const category of categories) {
        await prisma.category.create({
            data: {
                id: category.id,
                name: category.name,
                slug: category.slug,
                image: category.image,
                order: category.order,
                isActive: true,
            },
        })
    }

    for (const product of products) {
        await prisma.product.create({
            data: {
                id: product.id,
                categoryId: product.categoryId,
                name: product.name,
                description: product.description,
                price: product.price,
                image: product.image,
                order: product.order,
                isActive: true,
                isSoldOut: false,
            },
        })
    }

    console.log("✓ Admin user seeded")
    console.log("✓ Settings and campaign singletons seeded")
    console.log("✓ 4 kategori ve 6 ürün başarıyla eklendi")
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
