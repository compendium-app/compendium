import { Image } from "antd";
import { FC } from "react";
import { Link } from "react-router-dom";

import "./category-link.css";
import { CategoryItem } from "../../types/category-item";

interface CategoryLinkProps extends CategoryItem {}

const CategoryLink: FC<CategoryLinkProps> = ({ title, imgUrl, href }) => {
  return (
    <Link className="category-link" to={href}>
      <div className="category-link-image-container">
        <Image className="category-link-img" preview={false} src={imgUrl} />
      </div>
      <h3 className="category-title">{title}</h3>
    </Link>
  );
};

export default CategoryLink;
