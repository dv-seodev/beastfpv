import { useParams } from 'next/navigation';

export const useBreadcrumbs = (categoryData = null, categories = []) => {
    const params = useParams();
    const slugArray = params?.slug || [];

    const generateBreadcrumbs = () => {
        const breadcrumbs = [
            { name: 'Главная', href: '/' }
        ];

        let currentPath = '/category';

        slugArray.forEach((slug, index) => {
            currentPath += `/${slug}`;
            const isLast = index === slugArray.length - 1;

            let name = slug;

            // Ищем название категории в списке всех категорий
            if (index === 0) {
                const mainCategory = categories.find(cat => cat.slug === slug);
                if (mainCategory) {
                    name = mainCategory.name;
                }
            } else if (index === 1) {
                const parentSlug = slugArray[0];
                const parentCategory = categories.find(cat => cat.slug === parentSlug);
                if (parentCategory) {
                    const subCategory = parentCategory.subcategories?.find(sub => sub.slug === slug);
                    if (subCategory) {
                        name = subCategory.name;
                    }
                }
            }

            // Для последней категории используем загруженные данные
            if (isLast && categoryData?.name) {
                name = categoryData.name;
            }

            breadcrumbs.push({
                name: name,
                href: isLast ? null : currentPath,
                isCurrent: isLast
            });
        });

        return breadcrumbs;
    };

    return generateBreadcrumbs();
};
