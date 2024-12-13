;; Proposal Contract

(define-map proposals
  { proposal-id: uint }
  {
    title: (string-ascii 100),
    description: (string-utf8 1000),
    proposer: principal,
    start-block: uint,
    end-block: uint,
    status: (string-ascii 10),
    yes-votes: uint,
    no-votes: uint
  }
)

(define-data-var last-proposal-id uint u0)
(define-data-var voting-period uint u1440) ;; Default voting period: 1 day (assuming 10-minute blocks)

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-invalid-proposal (err u101))
(define-constant err-proposal-ended (err u102))

(define-public (create-proposal (title (string-ascii 100)) (description (string-utf8 1000)))
  (let
    (
      (new-proposal-id (+ (var-get last-proposal-id) u1))
    )
    (begin
      (map-set proposals
        { proposal-id: new-proposal-id }
        {
          title: title,
          description: description,
          proposer: tx-sender,
          start-block: block-height,
          end-block: (+ block-height (var-get voting-period)),
          status: "active",
          yes-votes: u0,
          no-votes: u0
        }
      )
      (var-set last-proposal-id new-proposal-id)
      (ok new-proposal-id)
    )
  )
)

(define-public (vote-on-proposal (proposal-id uint) (vote (string-ascii 3)))
  (let
    (
      (proposal (unwrap! (map-get? proposals { proposal-id: proposal-id }) err-invalid-proposal))
    )
    (begin
      (asserts! (< block-height (get end-block proposal)) err-proposal-ended)
      (map-set proposals
        { proposal-id: proposal-id }
        (merge proposal {
          yes-votes: (if (is-eq vote "yes") (+ (get yes-votes proposal) u1) (get yes-votes proposal)),
          no-votes: (if (is-eq vote "no") (+ (get no-votes proposal) u1) (get no-votes proposal))
        })
      )
      (ok true)
    )
  )
)

(define-public (execute-proposal (proposal-id uint))
  (let
    (
      (proposal (unwrap! (map-get? proposals { proposal-id: proposal-id }) err-invalid-proposal))
      (total-votes (+ (get yes-votes proposal) (get no-votes proposal)))
      (yes-percentage (/ (* (get yes-votes proposal) u100) total-votes))
    )
    (begin
      (asserts! (>= block-height (get end-block proposal)) err-proposal-ended)
      (asserts! (> total-votes u0) err-invalid-proposal)
      (if (> yes-percentage u50)
        (map-set proposals
          { proposal-id: proposal-id }
          (merge proposal { status: "passed" })
        )
        (map-set proposals
          { proposal-id: proposal-id }
          (merge proposal { status: "rejected" })
        )
      )
      (ok true)
    )
  )
)

(define-read-only (get-proposal (proposal-id uint))
  (ok (unwrap! (map-get? proposals { proposal-id: proposal-id }) err-invalid-proposal))
)

(define-public (set-voting-period (new-period uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (var-set voting-period new-period))
  )
)

(define-read-only (get-voting-period)
  (ok (var-get voting-period))
)

