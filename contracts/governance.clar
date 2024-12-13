;; Governance Contract

(define-data-var governance-model (string-ascii 20) "direct-democracy")
(define-data-var quorum-percentage uint u50)
(define-data-var voting-period uint u1440) ;; in blocks, default 1 day (assuming 10-minute blocks)

(define-map votes
  { proposal-id: uint, voter: principal }
  { vote: (string-ascii 3) }
)

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-invalid-governance-model (err u101))
(define-constant err-invalid-vote (err u102))

(define-public (set-governance-model (model (string-ascii 20)))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (or (is-eq model "direct-democracy")
                  (is-eq model "representative")
                  (is-eq model "quadratic-voting")) err-invalid-governance-model)
    (ok (var-set governance-model model))
  )
)

(define-public (set-quorum-percentage (percentage uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (and (>= percentage u1) (<= percentage u100)) err-invalid-governance-model)
    (ok (var-set quorum-percentage percentage))
  )
)

(define-public (set-voting-period (period uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (var-set voting-period period))
  )
)

(define-public (vote (proposal-id uint) (vote-value (string-ascii 3)))
  (begin
    (asserts! (or (is-eq vote-value "yes") (is-eq vote-value "no")) err-invalid-vote)
    (ok (map-set votes { proposal-id: proposal-id, voter: tx-sender } { vote: vote-value }))
  )
)

(define-read-only (get-vote (proposal-id uint) (voter principal))
  (ok (default-to { vote: "none" } (map-get? votes { proposal-id: proposal-id, voter: voter })))
)

(define-read-only (get-governance-model)
  (ok (var-get governance-model))
)

(define-read-only (get-quorum-percentage)
  (ok (var-get quorum-percentage))
)

(define-read-only (get-voting-period)
  (ok (var-get voting-period))
)

