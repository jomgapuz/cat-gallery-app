import styled from "@emotion/styled";
import * as React from "react";

export const MainPageOuter = styled.div`
  padding-left: 8px;
  padding-right: 8px;
`;

export const MainContentOuter = styled.div`
  margin-left: auto;
  margin-right: auto;
  max-width: 1000px;
`;

export type MainLayoutProps = {
  children?: React.ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <MainPageOuter>
      <MainContentOuter>{children}</MainContentOuter>
    </MainPageOuter>
  );
}
