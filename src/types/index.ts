export type Product = {
    id: string
    name: string
    slug: string
    era: string
    brand: string
    condition: string
    price: number
    sizes: string[]
    images: string[]
    story: string
    sold: boolean
    collection: string
    created_at: string
  }
  
  export type Order = {
    id: string
    customer_email: string
    items: CartItem[]
    total: number
    payment_id: string
    status: string
    created_at: string
  }
  
  export type CartItem = {
    product: Product
    size: string
    quantity: number
  }
  
  export type Subscriber = {
    id: string
    email: string
    push_token?: string
    created_at: string
  }