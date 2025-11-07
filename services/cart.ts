import { supabase } from './supabase';

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  variations: Record<string, string>;
  variationId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartSummary {
  totalItems: number;
  totalPrice: number;
  count: number;
}

export interface CartResponse {
  success: boolean;
  items: CartItem[];
  summary: CartSummary;
}

export interface AddToCartRequest {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  variations?: Record<string, string>;
  quantity: number;
}

export const cartService = {
  async getCart(): Promise<CartResponse> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('არ ხართ ავტორიზებული');
    }

    const { data, error } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Cart fetch error:', error);
      throw new Error('კალათის ჩატვირთვა ვერ მოხერხდა');
    }

    const items: CartItem[] = (data || []).map((item: any) => ({
      id: item.id,
      userId: item.user_id,
      productId: item.product_id,
      name: item.name,
      price: parseFloat(item.price),
      imageUrl: item.image_url,
      variations: item.variations || {},
      variationId: item.variation_id || '',
      quantity: item.quantity,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return {
      success: true,
      items,
      summary: {
        totalItems,
        totalPrice,
        count: items.length,
      },
    };
  },

  async addToCart(item: AddToCartRequest): Promise<{ success: boolean; item: CartItem; message: string }> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('არ ხართ ავტორიზებული');
    }

    const variationId = item.variations
      ? Object.values(item.variations).join('-')
      : item.productId;

    const { data: existingItems, error: fetchError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_id', item.productId)
      .eq('variation_id', variationId);

    if (fetchError) {
      console.error('Cart check error:', fetchError);
      console.error('Error details:', JSON.stringify(fetchError, null, 2));
      throw new Error(`პროდუქტის დამატება ვერ მოხერხდა: ${fetchError.message}`);
    }

    if (existingItems && existingItems.length > 0) {
      const existingItem = existingItems[0];
      const newQuantity = existingItem.quantity + item.quantity;

      const { data: updatedData, error: updateError } = await supabase
        .from('cart_items')
        .update({
          quantity: newQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingItem.id)
        .select()
        .single();

      if (updateError) {
        console.error('Cart update error:', updateError);
        console.error('Error details:', JSON.stringify(updateError, null, 2));
        throw new Error(`პროდუქტის დამატება ვერ მოხერხდა: ${updateError.message}`);
      }

      return {
        success: true,
        item: {
          id: updatedData.id,
          userId: updatedData.user_id,
          productId: updatedData.product_id,
          name: updatedData.name,
          price: parseFloat(updatedData.price),
          imageUrl: updatedData.image_url,
          variations: updatedData.variations || {},
          variationId: updatedData.variation_id,
          quantity: updatedData.quantity,
          createdAt: updatedData.created_at,
          updatedAt: updatedData.updated_at,
        },
        message: 'პროდუქტი წარმატებით დაემატა კალათაში',
      };
    }

    const { data: newData, error: insertError } = await supabase
      .from('cart_items')
      .insert({
        user_id: user.id,
        product_id: item.productId,
        name: item.name,
        price: item.price,
        image_url: item.imageUrl,
        variations: item.variations || {},
        variation_id: variationId,
        quantity: item.quantity,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Cart insert error:', insertError);
      console.error('Error details:', JSON.stringify(insertError, null, 2));
      throw new Error(`პროდუქტის დამატება ვერ მოხერხდა: ${insertError.message}`);
    }

    return {
      success: true,
      item: {
        id: newData.id,
        userId: newData.user_id,
        productId: newData.product_id,
        name: newData.name,
        price: parseFloat(newData.price),
        imageUrl: newData.image_url,
        variations: newData.variations || {},
        variationId: newData.variation_id,
        quantity: newData.quantity,
        createdAt: newData.created_at,
        updatedAt: newData.updated_at,
      },
      message: 'პროდუქტი წარმატებით დაემატა კალათაში',
    };
  },

  async updateQuantity(id: string, quantity: number): Promise<{ success: boolean; item: CartItem; message: string }> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('არ ხართ ავტორიზებული');
    }

    if (quantity <= 0) {
      return this.removeItem(id);
    }

    const { data, error } = await supabase
      .from('cart_items')
      .update({
        quantity,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Quantity update error:', error);
      throw new Error('რაოდენობის განახლება ვერ მოხერხდა');
    }

    return {
      success: true,
      item: {
        id: data.id,
        userId: data.user_id,
        productId: data.product_id,
        name: data.name,
        price: parseFloat(data.price),
        imageUrl: data.image_url,
        variations: data.variations || {},
        variationId: data.variation_id,
        quantity: data.quantity,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
      message: 'რაოდენობა განახლდა',
    };
  },

  async removeItem(id: string): Promise<{ success: boolean; message: string }> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('არ ხართ ავტორიზებული');
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Remove item error:', error);
      throw new Error('პროდუქტის წაშლა ვერ მოხერხდა');
    }

    return {
      success: true,
      message: 'პროდუქტი წაიშალა კალათიდან',
    };
  },

  async clearCart(): Promise<{ success: boolean; message: string }> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('არ ხართ ავტორიზებული');
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Clear cart error:', error);
      throw new Error('კალათის გაწმენდა ვერ მოხერხდა');
    }

    return {
      success: true,
      message: 'კალათა გაიწმინდა',
    };
  },
};
