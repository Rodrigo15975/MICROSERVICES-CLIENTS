-- CreateTable
CREATE TABLE "Clients" (
    "id" TEXT NOT NULL,
    "userIdGoogle" TEXT NOT NULL,
    "emailGoogle" TEXT NOT NULL,
    "nameGoogle" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Orders" (
    "id" TEXT NOT NULL,
    "clientsId" TEXT,
    "amount_total" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders_variants" (
    "id" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ordersItemsId" TEXT NOT NULL,

    CONSTRAINT "orders_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders_items" (
    "id" TEXT NOT NULL,
    "product" TEXT NOT NULL,
    "size" TEXT[],
    "price" DECIMAL(10,2) NOT NULL,
    "gender" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "discount" INTEGER,
    "categorie" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL,
    "discount" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "espiryDate" TIMESTAMP(3) NOT NULL,
    "expired" BOOLEAN NOT NULL,
    "code" TEXT NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,
    "clientsId" TEXT NOT NULL,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "addres" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone_number" INTEGER NOT NULL,
    "clientId" TEXT NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Clients_userIdGoogle_key" ON "Clients"("userIdGoogle");

-- CreateIndex
CREATE UNIQUE INDEX "Clients_emailGoogle_key" ON "Clients"("emailGoogle");

-- CreateIndex
CREATE INDEX "Clients_userIdGoogle_idx" ON "Clients"("userIdGoogle");

-- CreateIndex
CREATE INDEX "Clients_emailGoogle_idx" ON "Clients"("emailGoogle");

-- CreateIndex
CREATE UNIQUE INDEX "Orders_id_key" ON "Orders"("id");

-- CreateIndex
CREATE INDEX "Orders_id_idx" ON "Orders"("id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_variants_id_key" ON "orders_variants"("id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_items_id_key" ON "orders_items"("id");

-- CreateIndex
CREATE INDEX "orders_items_id_idx" ON "orders_items"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_clientsId_key" ON "Coupon"("clientsId");

-- CreateIndex
CREATE INDEX "Coupon_expired_idx" ON "Coupon"("expired");

-- CreateIndex
CREATE INDEX "Coupon_code_idx" ON "Coupon"("code");

-- CreateIndex
CREATE INDEX "Coupon_espiryDate_idx" ON "Coupon"("espiryDate");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_id_key" ON "Contact"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_clientId_key" ON "Contact"("clientId");

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_clientsId_fkey" FOREIGN KEY ("clientsId") REFERENCES "Clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders_variants" ADD CONSTRAINT "orders_variants_ordersItemsId_fkey" FOREIGN KEY ("ordersItemsId") REFERENCES "orders_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders_items" ADD CONSTRAINT "orders_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_clientsId_fkey" FOREIGN KEY ("clientsId") REFERENCES "Clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
