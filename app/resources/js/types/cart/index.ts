export type CartResponse = {
    id: number;
    product: {
        id: number;
        title: string;
        price: number;
        stock: number;
        image: string;
    };
    quantity: number;
};
