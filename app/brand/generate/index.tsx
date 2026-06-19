import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useProfileStore } from '../../../src/stores/useProfileStore';
import { useBrandStore } from '../../../src/stores/useBrandStore';
import { useAI } from '../../../src/hooks/useAI';
import { Loading } from '../../../src/components/ui';
import { navigate, ROUTES } from '../../../src/lib';

export default function BrandGenerateScreen() {
  const { t } = useTranslation();
  const profile = useProfileStore((s) => s.profile);
  const { selectedRecommendation, setBrand, setLoading } = useBrandStore();
  const { provider } = useAI();

  useEffect(() => {
    generate();
  }, []);

  async function generate() {
    if (!profile || !selectedRecommendation) {
      navigate(ROUTES.onboarding, { replace: true });
      return;
    }
    setLoading(true);
    const brand = await provider.generateBrand(profile, selectedRecommendation);
    setBrand(brand);
    setLoading(false);
    navigate(ROUTES.brandDetail(brand.id), { replace: true });
  }

  return <Loading message={t('brandGenerate.title')} submessage={t('brandGenerate.subtitle')} />;
}
