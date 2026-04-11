export const exportElementToPDF = async (
  elementId: string,
  fileName?: string,
  title?: string
) => {
  // Use native browser print for crisp vector PDFs
  // The layout is managed by app/print.css @media print 
  try {
    if (fileName) {
      document.title = fileName; // Temporarily change document title to set default save name
    }
    window.print();
  } catch (err) {
    console.error('Error triggering PDF print:', err);
    throw err;
  } finally {
    document.title = 'YĀTRĀ — AI Travel Planner for India';
  }
};

