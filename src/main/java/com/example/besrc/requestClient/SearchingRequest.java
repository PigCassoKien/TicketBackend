package com.example.besrc.requestClient;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class SearchingRequest {

    @NotBlank
    @NotNull
    private String keyword;

    @NotNull
    private int pageSize;

    @NotNull
    private int pageNum;

    public @NotBlank @NotNull String getKeyword() {
        return keyword;
    }

    public void setKeyword(@NotBlank @NotNull String keyword) {
        this.keyword = keyword;
    }

    @NotNull
    public int getPageSize() {
        return pageSize;
    }

    public void setPageSize(@NotNull int pageSize) {
        this.pageSize = pageSize;
    }

    @NotNull
    public int getPageNum() {
        return pageNum;
    }

    public void setPageNum(@NotNull int pageNum) {
        this.pageNum = pageNum;
    }
}
