import { CategoryItem } from "../../types/category-item";
import CategoryLink from "../../components/category-link/category-link";

import "./homepage.css";

const categoryMockData: CategoryItem[] = [
  {
    title: "NPM packages",
    imgUrl: "/npm.svg",
    href: "/graph",
  },
  {
    title: "Images",
    imgUrl: "/docker.svg",
    href: "/graph",
  },
  {
    title: "CI/CD",
    imgUrl: "/gitlab.svg",
    href: "/graph",
  },
  {
    title: "AWS services",
    imgUrl: "/aws.svg",
    href: "/graph",
  },
  {
    title: "Onprem services",
    imgUrl: "/server.svg",
    href: "/graph",
  },
  {
    title: "AWS deployments",
    imgUrl: "/aws-cloud.svg",
    href: "/graph",
  },
];

const Homepage = () => {
  return (
    <div className="homepage-wrapper">
      <div className="homepage-title-container">
        <h1>Hello there 👋</h1>
        <p>Select category and start exploring 🔭</p>
        <span />
      </div>
      <div className="categories-container">
        {categoryMockData.map((category, idx) => (
          <CategoryLink
            key={idx}
            title={category.title}
            imgUrl={category.imgUrl}
            href={category.href}
          />
        ))}
      </div>
    </div>
  );
};

export default Homepage;
