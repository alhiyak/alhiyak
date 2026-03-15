import { useState, useCallback, useMemo } from 'react';

const useSelection = (items = [], idKey = 'id') => {
  const [selectedIds, setSelectedIds] = useState([]);

  // تحديد/إلغاء تحديد عنصر واحد
  const toggleSelection = useCallback((id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
    );
  }, []);

  // تحديد الكل
  const selectAll = useCallback(() => {
    setSelectedIds(items.map(item => item[idKey]));
  }, [items, idKey]);

  // إلغاء تحديد الكل
  const deselectAll = useCallback(() => {
    setSelectedIds([]);
  }, []);

  // تحديد مجموعة من الأقلام (للاستخدام الداخلي)
  const setSelection = useCallback((ids) => {
    setSelectedIds(ids);
  }, []);

  // التحقق من تحديد الكل
  const isAllSelected = useMemo(() => {
    return items.length > 0 && selectedIds.length === items.length;
  }, [items, selectedIds]);

  // التحقق من تحديد عنصر معين
  const isSelected = useCallback((id) => selectedIds.includes(id), [selectedIds]);

  // الحصول على العناصر المحددة
  const selectedItems = useMemo(() => {
    return items.filter(item => selectedIds.includes(item[idKey]));
  }, [items, selectedIds, idKey]);

  // عدد العناصر المحددة
  const selectionCount = selectedIds.length;

  return {
    selectedIds,
    selectedItems,
    selectionCount,
    isAllSelected,
    toggleSelection,
    selectAll,
    deselectAll,
    setSelection,
    isSelected,
  };
};

export default useSelection;