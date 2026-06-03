const fs = require('fs');

const filesToRestoreNavigate = [
  'src/pages/ContactPage.tsx',
  'src/pages/LoginPage.tsx',
  'src/pages/RegisterPage.tsx',
  'src/pages/ResponsibleGamingPage.tsx',
  'src/pages/ResultsPage.tsx',
  'src/pages/SingleLotteryPage.tsx',
  'src/pages/WinnersPage.tsx'
];

const filesToRemoveRouterNavigate = [
  'src/pages/MyTicketsPage.tsx',
  'src/pages/TransactionHistoryPage.tsx',
  'src/pages/WalletPage.tsx'
];

filesToRestoreNavigate.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  // Find where routerNavigate is defined and insert navigate right after it
  c = c.replace(/const routerNavigate = useNavigate\(\)\r?\n?/g, "const routerNavigate = useNavigate()\n  const navigate = (path: string) => routerNavigate(path === 'home' ? '/' : `/${path}`)\n");
  fs.writeFileSync(f, c);
  console.log('Restored navigate in', f);
});

filesToRemoveRouterNavigate.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/\s*const routerNavigate = useNavigate\(\)\r?\n?/g, '');
  fs.writeFileSync(f, c);
  console.log('Removed routerNavigate in', f);
});
