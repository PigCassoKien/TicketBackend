package com.example.besrc.Repository;

import com.example.besrc.Entities.FeedBack;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<FeedBack, String> {
    List<FeedBack> findAllByAccountId(String accountId);

    @Query("select f from FeedBack f where f.account.username =: username order by DATE(f.update_at) asc")
    List<FeedBack> findAllByUserName(@Param("username") String username);
    List<FeedBack> findAllByFilmId(long filmId);

    boolean existsByAccountIdAndFilmId(String accountId, long filmId);
}
