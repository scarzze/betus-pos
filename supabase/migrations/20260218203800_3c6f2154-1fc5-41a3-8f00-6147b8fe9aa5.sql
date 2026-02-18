
-- Tighten sale_items insert policy to require user owns the parent sale
DROP POLICY "Users can insert sale items" ON public.sale_items;
CREATE POLICY "Users can insert sale items for own sales" ON public.sale_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sales WHERE id = sale_id AND user_id = auth.uid()
    )
  );
